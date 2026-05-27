import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import ConversationThread from '@/models/ConversationThread';
import mongoose from 'mongoose';
import { inngest } from '@/services/inngest/client';

export async function POST(req: Request) {
  try {
    // Twilio sends form data
    const formData = await req.formData();
    
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const profileName = formData.get('ProfileName') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0', 10);

    if (!from) return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' }});

    const phone = from.replace('whatsapp:', '');
    
    // In production, you would map the incoming 'To' number to a specific tenant/business.
    // For this module, we use the demo identifiers.
    const tenantId = 'demo-tenant';
    const businessId = new mongoose.Types.ObjectId('60b9b3b3b3b3b3b3b3b3b3b3');

    await dbConnect();

    // 1. Fetch or Create Lead
    let lead = await Lead.findOne({ phone, businessId });
    if (!lead) {
      lead = await Lead.create({
        tenantId,
        businessId,
        name: profileName || phone,
        phone,
        source: 'WhatsApp',
        pipelineStage: 'New',
        status: 'active'
      });
      
      // Trigger CRM module lead creation hook
      await inngest.send({
        name: 'crm/lead-created',
        data: { leadId: lead._id.toString() }
      });
    }

    // 2. Fetch or Create Conversation Thread
    let thread = await ConversationThread.findOne({ leadId: lead._id });
    if (!thread) {
      thread = await ConversationThread.create({
        tenantId,
        businessId,
        leadId: lead._id,
        unreadCount: 1,
        lastMessage: numMedia > 0 ? '[Media]' : body,
        aiEnabled: true // AI is ON by default
      });
    } else {
      thread.unreadCount += 1;
      thread.lastMessage = numMedia > 0 ? '[Media]' : body;
      thread.lastActivityAt = new Date();
      await thread.save();
    }

    // 3. Immediately queue async AI processing
    // Do NOT call Groq/OpenAI here. Just push to Inngest.
    await inngest.send({
      name: 'whatsapp/incoming',
      data: {
        messageSid,
        from,
        body,
        profileName,
        numMedia,
        leadId: lead._id.toString(),
        threadId: thread._id.toString(),
        tenantId,
        businessId: businessId.toString()
      }
    });

    // 4. Return instant 200 OK to Twilio (Empty TwiML)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    // Still return 200 to prevent Twilio retry loops
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
