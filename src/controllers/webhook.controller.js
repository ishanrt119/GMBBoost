const whatsappService = require('../services/whatsapp.service');
const aiService = require('../services/ai.service');
const sessionService = require('../services/session.service');
const leadService = require('../services/lead.service');
const bookingService = require('../services/booking.service');
const axios = require('axios');

const verifyToken = (req, res) => {
  res.sendStatus(200);
};

const handleMessage = async (req, res) => {
  try {
    let phone = req.body.From.replace('whatsapp:', '').trim();
    if (!phone.startsWith('+')) {
      phone = `+${phone}`;
    }

    const userText = req.body.Body;
    if (!userText || userText.trim() === '') {
      res.set('Content-Type', 'text/xml');
      res.send('<Response></Response>');
      return;
    }

    console.log(`📩 From ${phone}: ${userText}`);

    const session = await sessionService.getOrCreate(phone);

    session.messages.push({ role: 'user', content: userText });

    const aiReply = await aiService.getReply(session.messages);

    session.messages.push({ role: 'assistant', content: aiReply });

    await sessionService.save(phone, session);

    // ── Handle NAME_RECEIVED tag ──
    if (!session.leadCaptured) {
      const nameMatch = aiReply.match(/NAME_RECEIVED::name=(.+?)(?:\n|$)/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        if (name && name.length >= 2 && name !== '<name>') {
          await leadService.saveOrUpdate(phone, name, 'Unknown');
          console.log(`👤 Name received, lead created: ${name}`);
        }
      }
    }

    // ── Handle LEAD_CAPTURED tag ──
    if (!session.leadCaptured) {
      const leadMatch = aiReply.match(
        /LEAD_CAPTURED::name=(.+?)\|\|interest=(.+?)(?:\n|$)/
      );
      if (leadMatch) {
        const lead = await leadService.extractAndSave(phone, session.messages);
        if (lead) {
          session.leadCaptured = true;
          await sessionService.save(phone, session);
          await triggerFollowUp(phone, lead);
        }
      }
    }

    // ── Handle INTEREST_UPDATED tag ──
    const interestMatch = aiReply.match(/INTEREST_UPDATED::interest=(.+?)(?:\n|$)/);
    if (interestMatch) {
      const interest = interestMatch[1].trim();
      const allLeads = await leadService.getAllLeads();
      const lead = allLeads.find(l => l.phone === phone);
      if (lead) {
        await leadService.saveOrUpdate(phone, lead.name, interest);
        console.log(`🔄 Interest updated: ${interest}`);
      }
    }

    // ── Handle BOOKING_CONFIRMED tag ──
    if (!session.bookingDone) {
      const bookingMatch = aiReply.match(
        /BOOKING_CONFIRMED::name=(.+?)\|\|date=(.+?)\|\|time=(.+?)(?:\n|$)/
      );
      if (bookingMatch) {
        const bookingDate = new Date(`${bookingMatch[2].trim()} ${bookingMatch[3].trim()}`);
        const now = new Date();

        if (bookingDate <= now) {
          console.log(`⚠️ Booking date in past rejected: ${bookingDate}`);
          session.messages.push({
            role: 'user',
            content: 'Please note that date is in the past, ask for a future date'
          });
          await sessionService.save(phone, session);
        } else {
          await bookingService.save(phone, {
            name: bookingMatch[1].trim(),
            date: bookingMatch[2].trim(),
            time: bookingMatch[3].trim()
          });
          session.bookingDone = true;
          await sessionService.save(phone, session);
          console.log(`📅 Booking confirmed for ${phone}`);
        }
      }
    }

    // ── Handle HUMAN_HANDOFF tag ──
    const handoffMatch = aiReply.match(/HUMAN_HANDOFF/);
    if (handoffMatch) {
      console.log(`🚨 Human handoff needed for ${phone}`);
      session.needsHuman = true;
      await sessionService.save(phone, session);
      await triggerHandoff(phone, session);
    }

    // Clean reply — remove all tags before sending to user
    const cleanReply = aiReply
      .replace(/NAME_RECEIVED::.+/g, '')
      .replace(/LEAD_CAPTURED::.+/g, '')
      .replace(/INTEREST_UPDATED::.+/g, '')
      .replace(/BOOKING_CONFIRMED::.+/g, '')
      .replace(/HUMAN_HANDOFF/g, '')
      .trim();

    const toNumber = phone.startsWith('+') ? phone : `+${phone}`;
    await whatsappService.sendMessage(toNumber, cleanReply);

    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.sendStatus(500);
  }
};

const triggerFollowUp = async (phone, lead) => {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.log(`🔁 Follow-up trigger (n8n not connected): ${phone}`, lead);
      return;
    }
    await axios.post(n8nUrl, {
      event: 'FOLLOW_UP',
      phone,
      name: lead.name,
      interest: lead.interest,
      source: 'WhatsApp',
      timestamp: new Date()
    });
    console.log(`🔁 Follow-up triggered for ${phone}`);
  } catch (err) {
    console.error('Follow-up trigger error:', err.message);
  }
};

const triggerHandoff = async (phone, session) => {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.log(`🚨 Handoff trigger (n8n not connected) for ${phone}`);
      return;
    }
    await axios.post(n8nUrl, {
      event: 'HUMAN_HANDOFF',
      phone,
      conversationHistory: session.messages,
      timestamp: new Date()
    });
    console.log(`🚨 Handoff triggered for ${phone}`);
  } catch (err) {
    console.error('Handoff trigger error:', err.message);
  }
};

module.exports = { verifyToken, handleMessage };