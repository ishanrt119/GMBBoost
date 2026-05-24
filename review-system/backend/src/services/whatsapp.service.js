 // backend/src/services/whatsapp.service.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, name, service, link, businessName) => {
  try {
    // Clean the number — remove spaces, dashes, etc.
    let cleaned = to.replace(/\D/g, '');

    // Fix all formats to proper 91XXXXXXXXXX
    if (cleaned.startsWith('919') && cleaned.length === 12) {
      // Already correct → +919820011234 → 919820011234 ✅
      cleaned = cleaned;
    } else if (cleaned.length === 10) {
      // 10 digit → add 91 → 7028630603 → 917028630603
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Starts with 0 → replace with 91 → 07028630603 → 917028630603
      cleaned = '91' + cleaned.slice(1);
    } else if (cleaned.length === 11 && !cleaned.startsWith('91')) {
      // 11 digits no 91 → add 91
      cleaned = '91' + cleaned;
    }
    // anything else → use as is

    console.log('📱 Sending WhatsApp to:', cleaned);

    const message = `Hi ${name}! 👋

Thank you for choosing ${businessName}! 💆

We hope you enjoyed ${service}. We'd love to hear your feedback — please take a moment to leave us a review:

⭐ ${link}

Your review means a lot to us! 🙏
— ${businessName} Team`;

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+${cleaned}`,
      body: message
    });

    console.log('✅ WhatsApp sent to:', cleaned, '| SID:', response.sid);
    return { success: true, sid: response.sid };

  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsApp };