const express = require('express');
const router = express.Router();
const sessionService = require('../services/session.service');
const leadService = require('../services/lead.service');
const bookingService = require('../services/booking.service');

router.get('/leads', async (req, res) => {
  const leads = await leadService.getAllLeads();
  res.json({ count: leads.length, leads });
});

router.get('/sessions', async (req, res) => {
  const sessions = await sessionService.getAll();
  res.json({ count: sessions.length, sessions });
});

router.get('/bookings', async (req, res) => {
  const bookings = await bookingService.getAll();
  res.json({ count: bookings.length, bookings });
});

router.get('/all', async (req, res) => {
  const leads = await leadService.getAllLeads();
  const bookings = await bookingService.getAll();
  const sessions = await sessionService.getAll();
  res.json({
    leads: { count: leads.length, data: leads },
    bookings: { count: bookings.length, data: bookings },
    sessions: { count: sessions.length, data: sessions }
  });
});

module.exports = router;