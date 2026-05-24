import twilio from 'twilio';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendWhatsApp = async (to: string, name: string, service: string, link: string, businessName: string) => {
  if (!client) {
    console.warn('Twilio client not initialized (missing credentials). Mocking WhatsApp send.');
    return { success: true, sid: 'mock_sid_whatsapp' };
  }

  try {
    // Clean the number
    let cleaned = to.replace(/\D/g, '');

    // Format to 91XXXXXXXXXX for India if not already
    if (cleaned.startsWith('919') && cleaned.length === 12) {
      // Valid
    } else if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.slice(1);
    } else if (cleaned.length === 11 && !cleaned.startsWith('91')) {
      cleaned = '91' + cleaned;
    }

    const message = `Hi ${name}! 👋\n\nThank you for choosing ${businessName}! 💆\n\nWe hope you enjoyed ${service || 'your visit'}. We'd love to hear your feedback — please take a moment to leave us a review:\n\n⭐ ${link}\n\nYour review means a lot to us! 🙏\n— ${businessName} Team`;

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:+${cleaned}`,
      body: message
    });

    console.log('✅ WhatsApp sent to:', cleaned, '| SID:', response.sid);
    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error('❌ WhatsApp error:', error.message);
    return { success: false, error: error.message };
  }
};
