 // src/controllers/campaign.controller.js
const { prisma }       = require('../utils/prisma');
const { sendWhatsApp } = require('../services/whatsapp.service');
const { sendEmail }    = require('../services/email.service');
const { sendSMS }      = require('../services/sms.service');
const { logger }       = require('../utils/logger');

exports.createCampaign = async (req, res, next) => {
  try {
    const { name, channel, customerIds, day2Reminder, day5Reminder, stopOnReview, scheduledAt } = req.body;
    const businessId = req.user.businessId;

    const campaign = await prisma.campaign.create({
      data: {
        businessId, name,
        channel: channel || 'WHATSAPP',
        day2Reminder: day2Reminder ?? true,
        day5Reminder: day5Reminder ?? true,
        stopOnReview: stopOnReview ?? true,
        scheduledAt:  scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    if (customerIds?.length) {
      await prisma.reviewRequest.createMany({
        data: customerIds.map((customerId) => ({
          campaignId: campaign.id, customerId,
          channel: channel || 'WHATSAPP', status: 'QUEUED',
        })),
      });
    }

    res.status(201).json({ success: true, campaign });
  } catch (err) { next(err); }
};

exports.launchCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, businessId: req.user.businessId },
      include: {
        requests: { where: { status: 'QUEUED' }, include: { customer: true } },
        business: true,
      },
    });

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.status === 'ACTIVE') return res.status(400).json({ success: false, message: 'Already active' });

    await prisma.campaign.update({ where: { id }, data: { status: 'ACTIVE' } });

    let sent = 0, failed = 0;

    for (const request of campaign.requests) {
      const { customer } = request;
      const name    = `${customer.firstName} ${customer.lastName || ''}`.trim();
      const service = customer.service || 'your recent visit';

      // ✅ Use tracking link for all channels so clicks are tracked
      const trackingLink = `${process.env.BACKEND_URL}/review/${request.id}`;

      // Fallback Google review link if no tracking
      const googleLink = campaign.business.reviewLink ||
        `https://g.page/r/${campaign.business.googlePlaceId}/review`;

      const businessName = campaign.business.name || 'Glamour Salon & Spa';

      try {
        if (request.channel === 'WHATSAPP' && customer.phone) {
          // ✅ WhatsApp via Twilio Sandbox
          await sendWhatsApp(customer.phone, name, service, trackingLink, businessName);

        } else if (request.channel === 'EMAIL' && customer.email) {
          // ✅ Email via SendGrid with tracking
          await sendEmail(customer.email, name, service, trackingLink, businessName, request.id);

        } else if (request.channel === 'SMS' && customer.phone) {
          // ✅ SMS via Twilio
          await sendSMS(customer.phone, name, service, trackingLink, businessName);

        } else {
          // ⚠️ No valid channel or contact info
          logger.warn(`Skipping request ${request.id} — no valid channel/contact for customer ${customer.id}`);
          await prisma.reviewRequest.update({
            where: { id: request.id },
            data: { status: 'FAILED', failReason: 'No valid contact info or channel' },
          });
          failed++;
          continue;
        }

        await prisma.reviewRequest.update({
          where: { id: request.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
        sent++;
        logger.info(`✅ Sent to ${name} via ${request.channel}`);

      } catch (e) {
        logger.error(`❌ Failed to send to ${customer.email || customer.phone}: ${e.message}`);
        await prisma.reviewRequest.update({
          where: { id: request.id },
          data: { status: 'FAILED', failedAt: new Date(), failReason: e.message },
        });
        failed++;
      }
    }

    res.json({
      success: true,
      message: `Campaign launched`,
      sent,
      failed,
      total: campaign.requests.length,
    });

  } catch (err) { next(err); }
};

exports.listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { businessId: req.user.businessId },
      include: { requests: { select: { status: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      campaigns: campaigns.map((c) => ({
        ...c,
        stats: {
          total:    c.requests.length,
          sent:     c.requests.filter((r) => ['SENT','CLICKED','REVIEWED'].includes(r.status)).length,
          clicked:  c.requests.filter((r) => ['CLICKED','REVIEWED'].includes(r.status)).length,
          reviewed: c.requests.filter((r) => r.status === 'REVIEWED').length,
          failed:   c.requests.filter((r) => r.status === 'FAILED').length,
          queued:   c.requests.filter((r) => r.status === 'QUEUED').length,
        },
        requests: undefined,
      })),
    });
  } catch (err) { next(err); }
};

exports.campaignStats = async (req, res, next) => {
  try {
    const requests = await prisma.reviewRequest.findMany({
      where: { campaignId: req.params.id },
      include: {
        review: true,
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } }
      },
    });
    res.json({ success: true, requests });
  } catch (err) { next(err); }
};

exports.pauseCampaign = async (req, res, next) => {
  try {
    await prisma.campaign.update({ where: { id: req.params.id }, data: { status: 'PAUSED' } });
    res.json({ success: true, message: 'Campaign paused' });
  } catch (err) { next(err); }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.reviewRequest.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) { next(err); }
};