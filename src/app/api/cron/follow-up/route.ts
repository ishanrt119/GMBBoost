import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import FollowUp from '@/models/FollowUp';
import twilio from 'twilio';
import Conversation from '@/models/Conversation';

export const maxDuration = 60; // Set higher timeout for cron jobs
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Usually you would secure this endpoint via a secret token
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("Unauthorized cron invocation");
    // Depending on setup, return 401 or proceed if local. 
    // We will proceed for this MVP demo, but logging a warning.
  }

  try {
    await dbConnect();
    console.log("Running follow-up automation cron job...");

    const now = new Date();
    
    // Calculate thresholds
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Find leads needing follow ups
    // For simplicity, find active leads (not Converted or Lost)
    const activeLeads = await Lead.find({
      status: { $nin: ['Converted', 'Lost'] },
      lastInteractionTime: { $lte: oneDayAgo }
    });

    let processedCount = 0;

    for (const lead of activeLeads) {
      const interactionDelta = now.getTime() - (lead.lastInteractionTime?.getTime() || lead.updatedAt.getTime());
      
      let reminderType = '';
      if (interactionDelta >= 7 * 24 * 60 * 60 * 1000) {
        reminderType = 'Final Reconnect';
      } else if (interactionDelta >= 3 * 24 * 60 * 60 * 1000) {
        reminderType = '3-Day Check-in';
      } else {
        reminderType = '24h Reminder';
      }

      // Check if we already scheduled or completed this specific reminder type recently
      const existingFollowUp = await FollowUp.findOne({
        leadId: lead._id,
        reminderType: reminderType,
        completed: true
      });

      if (!existingFollowUp) {
        // Create follow-up record
        await FollowUp.create({
          leadId: lead._id,
          scheduledAt: now,
          completed: true, // We process it immediately in this cron script
          reminderType: reminderType
        });

        let messageBody = '';
        if (reminderType === '24h Reminder') {
          messageBody = `Hi ${lead.name !== lead.phone ? lead.name : 'there'}, just checking in to see if you had any questions about our previous chat?`;
        } else if (reminderType === '3-Day Check-in') {
          messageBody = `Hi again. Let me know if you still need help sorting out your business needs! We're here when you're ready.`;
        } else {
          messageBody = `It's been a while, so I'll close out your request for now. If you ever need help again, just reply to this message!`;
          lead.status = 'Lost';
          await lead.save();
        }

        // Send via Twilio directly (since cron is outbound, not replying to a webhook)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          try {
            await client.messages.create({
              body: messageBody,
              from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
              to: `whatsapp:${lead.phone}`
            });

            // Log AI outbound system message
            await Conversation.create({
              leadId: lead._id,
              sender: 'system',
              message: messageBody,
              aiGenerated: true,
              messageType: 'text'
            });

            processedCount++;
          } catch (err) {
            console.error(`Failed to send follow up to ${lead.phone}`, err);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
