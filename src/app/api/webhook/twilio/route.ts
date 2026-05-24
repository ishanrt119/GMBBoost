import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Conversation from '@/models/Conversation';
import Appointment from '@/models/Appointment';
import { generateSalesResponse, extractLeadInsights } from '@/services/ai';
import axios from 'axios';

const { MessagingResponse } = twilio.twiml;

const FALLBACK_MESSAGE = "Sorry, I’m facing a temporary issue right now. Please try again in a moment.";
const MEDIA_UNSUPPORTED_MESSAGE = "Currently I can only process text messages.";

function generateTwiMLResponse(messageText?: string) {
  const twiml = new MessagingResponse();
  if (messageText) {
    twiml.message(messageText);
  }
  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const from = params.get('From');
    const body = params.get('Body')?.trim() || '';
    const messageSid = params.get('MessageSid') || params.get('SmsMessageSid');
    const messageStatus = params.get('MessageStatus') || params.get('SmsStatus');
    const numMedia = parseInt(params.get('NumMedia') || '0', 10);
    
    // 1. Ignore delivery receipts and status callbacks
    if (messageStatus) {
      return generateTwiMLResponse();
    }

    if (!from || !messageSid) {
      console.warn("Invalid incoming webhook payload (missing From or MessageSid).");
      return generateTwiMLResponse();
    }

    // 2. Duplicate detection
    const existingMessage = await Conversation.findOne({ twilioMessageSid: messageSid });
    if (existingMessage) {
      console.log(`Duplicate event detected for MessageSid: ${messageSid}. Ignoring.`);
      // Returning empty TwiML prevents Twilio from repeating or sending anything
      return generateTwiMLResponse();
    }

    const phoneNumber = from.replace('whatsapp:', '');

    // 3. Find or create lead and update session tracking
    let lead = await Lead.findOne({ phone: phoneNumber });
    if (!lead) {
      lead = await Lead.create({
        name: phoneNumber,
        phone: phoneNumber,
        source: 'WhatsApp',
        status: 'New',
        retryCount: 0
      });
    } else {
      if (lead.status === 'New') {
        lead.status = 'Contacted';
      }
    }
    
    // Update interaction time
    lead.lastInteractionTime = new Date();
    await lead.save();

    // 4. Handle Media Messages
    if (numMedia > 0) {
      await Conversation.create({
        leadId: lead._id,
        sender: 'user',
        message: '[Media Message]',
        aiGenerated: false,
        twilioMessageSid: messageSid,
        messageType: 'media',
        aiProcessed: true,
      });

      await Conversation.create({
        leadId: lead._id,
        sender: 'system',
        message: MEDIA_UNSUPPORTED_MESSAGE,
        aiGenerated: true,
        messageType: 'text'
      });

      return generateTwiMLResponse(MEDIA_UNSUPPORTED_MESSAGE);
    }

    // 5. Ignore Empty Messages
    if (!body) {
      console.log("Empty body detected. Ignoring.");
      return generateTwiMLResponse();
    }

    // 6. Save User message
    await Conversation.create({
      leadId: lead._id,
      sender: 'user',
      message: body,
      aiGenerated: false,
      twilioMessageSid: messageSid,
      messageType: 'text',
      aiProcessed: false
    });

    // 7. Session Management & Fallback Loop Prevention
    // If the last message was a fallback, increment retry count.
    if (lead.lastAIReply === FALLBACK_MESSAGE) {
      lead.retryCount = (lead.retryCount || 0) + 1;
    } else {
      lead.retryCount = 0;
    }
    
    if (lead.retryCount >= 3) {
      console.log(`Stopping AI replies for lead ${lead._id} to prevent loop. Retry count: ${lead.retryCount}`);
      await lead.save();
      // Silently ignore to stop loop
      return generateTwiMLResponse();
    }

    // Get conversation history for AI
    const history = await Conversation.find({ leadId: lead._id })
      .sort({ timestamp: -1 })
      .limit(10);
      
    const ascendingHistory = [...history].reverse();
    
    const aiContext = ascendingHistory
      .filter(msg => msg.messageType === 'text' && msg.sender !== 'system')
      .map(msg => ({
        role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.message
      }));

    // 8. Generate AI Response
    let aiResponse = "";
    const startTime = Date.now();
    try {
      aiResponse = await generateSalesResponse(aiContext, lead);
      console.log(`AI generation successful in ${Date.now() - startTime}ms.`);
    } catch (e) {
      console.error("AI Generation Error", e);
      aiResponse = FALLBACK_MESSAGE;
    }

    // Update lead session state
    lead.lastUserMessage = body;
    lead.lastAIReply = aiResponse;
    
    // --- TAG PARSING & SIDE EFFECTS ---
    let cleanReply = aiResponse;

    // 1. Handle NAME_RECEIVED tag
    const nameMatch = aiResponse.match(/NAME_RECEIVED::name=(.+?)(?:\n|$)/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (name && name.length >= 2 && name !== '<name>') {
        if (lead.name === lead.phone) {
          lead.name = name;
        }
      }
    }

    // 2. Handle LEAD_CAPTURED tag
    const leadMatch = aiResponse.match(/LEAD_CAPTURED::name=(.+?)\|\|interest=(.+?)(?:\n|$)/);
    if (leadMatch) {
      const name = leadMatch[1].trim();
      const interest = leadMatch[2].trim();
      if (lead.name === lead.phone) lead.name = name;
      if (interest && interest !== '<interest>') lead.interest = interest;
      
      // Trigger n8n webhook for follow up
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        axios.post(n8nUrl, {
          event: 'FOLLOW_UP',
          phone: lead.phone,
          name: lead.name,
          interest: lead.interest,
          source: 'WhatsApp',
          timestamp: new Date()
        }).catch(err => console.error("N8N Webhook Follow-up Error:", err.message));
      }
    }

    // 3. Handle INTEREST_UPDATED tag
    const interestMatch = aiResponse.match(/INTEREST_UPDATED::interest=(.+?)(?:\n|$)/);
    if (interestMatch) {
      const interest = interestMatch[1].trim();
      if (interest && interest !== '<interest>') {
        lead.interest = interest;
      }
    }

    // 4. Handle BOOKING_CONFIRMED tag
    const bookingMatch = aiResponse.match(/BOOKING_CONFIRMED::name=(.+?)\|\|date=(.+?)\|\|time=(.+?)(?:\n|$)/);
    if (bookingMatch) {
      const bName = bookingMatch[1].trim();
      const bDate = bookingMatch[2].trim();
      const bTime = bookingMatch[3].trim();
      const bookingDate = new Date(`${bDate} ${bTime}`);
      const now = new Date();

      if (bookingDate <= now) {
        cleanReply = 'Please note that the date is in the past, ask for a future date';
      } else {
        await Appointment.create({
          leadId: lead._id,
          date: bDate,
          time: bTime,
          status: 'Scheduled'
        });
        lead.status = 'Booking Pending';
      }
    }

    // 5. Handle HUMAN_HANDOFF tag
    const handoffMatch = aiResponse.match(/HUMAN_HANDOFF/);
    if (handoffMatch) {
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        axios.post(n8nUrl, {
          event: 'HUMAN_HANDOFF',
          phone: lead.phone,
          conversationHistory: aiContext,
          timestamp: new Date()
        }).catch(err => console.error("N8N Webhook Handoff Error:", err.message));
      }
    }

    // Strip tags from clean reply
    cleanReply = cleanReply
      .replace(/NAME_RECEIVED::.+/g, '')
      .replace(/LEAD_CAPTURED::.+/g, '')
      .replace(/INTEREST_UPDATED::.+/g, '')
      .replace(/BOOKING_CONFIRMED::.+/g, '')
      .replace(/HUMAN_HANDOFF/g, '')
      .trim();

    await lead.save();

    // 9. Save AI response to DB
    await Conversation.create({
      leadId: lead._id,
      sender: aiResponse === FALLBACK_MESSAGE ? 'system' : 'ai',
      message: cleanReply,
      aiGenerated: true,
      messageType: 'text',
      aiProcessed: true
    });
    
    // Mark original message as processed
    await Conversation.updateOne({ twilioMessageSid: messageSid }, { $set: { aiProcessed: true } });

    // 10. Background or inline Extraction of CRM fields
    if (aiResponse !== FALLBACK_MESSAGE) {
      // Re-fetch or build history including the new messages
      const updatedAiContext = [...aiContext, { role: 'assistant' as const, content: aiResponse }];
      
      try {
        const insights = await extractLeadInsights(updatedAiContext, {
          businessType: lead.businessType,
          budget: lead.budget,
          urgency: lead.urgency,
          intentScore: lead.intentScore,
          qualificationStatus: lead.qualificationStatus
        });

        if (insights) {
          if (insights.businessType) lead.businessType = insights.businessType;
          if (insights.budget) lead.budget = insights.budget;
          if (insights.urgency) lead.urgency = insights.urgency;
          if (insights.requirements) lead.requirements = insights.requirements;
          
          if (typeof insights.intentScore === 'number') {
            lead.intentScore = Math.max(lead.intentScore || 0, insights.intentScore);
          }
          
          if (insights.qualificationStatus && ['Unqualified', 'Qualified', 'Sales Ready'].includes(insights.qualificationStatus)) {
            lead.qualificationStatus = insights.qualificationStatus;
            
            // Auto-update overarching lead pipeline status based on qualification
            if (insights.qualificationStatus === 'Sales Ready' && lead.status !== 'Converted') {
              lead.status = 'Interested';
            } else if (insights.qualificationStatus === 'Qualified' && lead.status === 'New') {
              lead.status = 'Qualified';
            }
          }
          await lead.save();
        }
      } catch (err) {
        console.error("Extraction error:", err);
      }
    }

    // 11. Return valid TwiML Response
    return generateTwiMLResponse(cleanReply);

  } catch (error) {
    console.error('Critical Webhook error:', error);
    // Graceful failure: Do not crash webhook, return empty valid TwiML
    return generateTwiMLResponse();
  }
}
