import twilio from 'twilio';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendSMS = async (to: string, customerName: string, service: string, reviewLink: string, businessName: string) => {
  if (!client) {
    console.warn('Twilio client not initialized (missing credentials). Mocking SMS send.');
    return { success: true, sid: 'mock_sid_sms' };
  }

  try {
    const body = `Hi ${customerName}! Thank you for visiting ${businessName} for your ${service || 'visit'}. Would you mind leaving us a quick Google review? ${reviewLink} (Reply STOP to opt out)`;

    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER || '+1234567890',
      to,
    });

    console.log(`✅ SMS sent to ${to}: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (error: any) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};
