const twilio = require('twilio');

let client;

const getClient = () => {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
};

const sendMessage = async (to, message) => {
  try {
    const toNumber = to.startsWith('+') ? to : `+${to}`;
    
    await getClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message
    });
    console.log(`📤 Message sent to ${to}`);
  } catch (err) {
    console.error('Twilio send error:', err.message);
  }
};

module.exports = { sendMessage };