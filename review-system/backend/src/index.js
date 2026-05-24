// src/index.js
require('dotenv').config();
const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const { logger } = require('./utils/logger');
const { startAutoPoll } = require('./services/autopoll.service');

const authRoutes     = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const campaignRoutes = require('./routes/campaign.routes');
const reviewRoutes   = require('./routes/review.routes');
const aiRoutes       = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// Track review link click
app.get('/review/:requestId', async (req, res) => {
  try {
    const { prisma } = require('./utils/prisma');
    const { requestId } = req.params;

    // Find the request
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: { campaign: { include: { business: true } } },
    });

    if (!request) return res.redirect('https://google.com');

    // Mark as clicked if not already reviewed
    if (request.status === 'SENT' || request.status === 'QUEUED') {
      await prisma.reviewRequest.update({
        where: { id: requestId },
        data: { status: 'CLICKED', clickedAt: new Date() },
      });
    }

    // Redirect to Google review link
    const reviewLink = request.campaign?.business?.reviewLink ||
      'https://search.google.com/local/writereview?placeid=' +
      (request.campaign?.business?.googlePlaceId || '');

    res.redirect(reviewLink);
  } catch (err) {
    res.redirect('https://google.com');
  }
});

app.use('/api/auth',      authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, _next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

 app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  startAutoPoll();
});
