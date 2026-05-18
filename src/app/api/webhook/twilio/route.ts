import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Conversation from '@/models/Conversation';
import { generateSalesResponse } from '@/services/ai';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Twilio sends data as x-www-form-urlencoded
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const from = params.get('From'); // e.g., 'whatsapp:+14155238886'
    const body = params.get('Body');

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing from or body' }, { status: 400 });
    }

    // Extract the actual phone number
    const phoneNumber = from.replace('whatsapp:', '');

    // 1. Find or create lead
    let lead = await Lead.findOne({ phone: phoneNumber });
    if (!lead) {
      lead = await Lead.create({
        name: phoneNumber, // temporary name
        phone: phoneNumber,
        source: 'WhatsApp',
        status: 'New'
      });
    } else {
      // Update status if it was inactive or new
      if (lead.status === 'New') {
        lead.status = 'Contacted';
        await lead.save();
      }
    }

    // 2. Save user message
    await Conversation.create({
      leadId: lead._id,
      sender: 'user',
      message: body,
      aiGenerated: false
    });

    // 3. Get recent conversation history
    const history = await Conversation.find({ leadId: lead._id })
      .sort({ timestamp: 1 })
      .limit(20);

    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    // 4. Generate AI response
    const aiResponse = await generateSalesResponse(formattedHistory, lead);

    // 5. Save AI response
    await Conversation.create({
      leadId: lead._id,
      sender: 'ai',
      message: aiResponse,
      aiGenerated: true
    });

    // 6. Send reply via Twilio
    await client.messages.create({
      body: aiResponse,
      from: `whatsapp:${twilioNumber}`,
      to: from
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
