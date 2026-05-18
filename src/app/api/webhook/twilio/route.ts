import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Conversation from '@/models/Conversation';
import { generateSalesResponse } from '@/services/ai';

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
        role: msg.sender === 'user' ? 'user' : 'assistant',
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
    await lead.save();

    // 9. Save AI response to DB
    await Conversation.create({
      leadId: lead._id,
      sender: aiResponse === FALLBACK_MESSAGE ? 'system' : 'ai',
      message: aiResponse,
      aiGenerated: true,
      messageType: 'text',
      aiProcessed: true
    });
    
    // Mark original message as processed
    await Conversation.updateOne({ twilioMessageSid: messageSid }, { $set: { aiProcessed: true } });

    // 10. Return valid TwiML Response
    return generateTwiMLResponse(aiResponse);

  } catch (error) {
    console.error('Critical Webhook error:', error);
    // Graceful failure: Do not crash webhook, return empty valid TwiML
    return generateTwiMLResponse();
  }
}
