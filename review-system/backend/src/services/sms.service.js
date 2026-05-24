// src/services/sms.service.js
const twilio = require('twilio');
const { logger } = require('../utils/logger');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendSMS = async (to, customerName, service, reviewLink, businessName) => {
  const body = `Hi ${customerName}! Thank you for visiting ${businessName} for your ${service}. Would you mind leaving us a quick Google review? ${reviewLink} (Reply STOP to opt out)`;

  const msg = await client.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER,
    to,
  });

  logger.info(`SMS sent to ${to}: ${msg.sid}`);
  return msg;
};
