// src/controllers/dashboard.controller.js
const { prisma } = require('../utils/prisma');

exports.getStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    const [customers, requests, reviews, campaignCount] = await Promise.all([
      prisma.customer.count({ where: { businessId } }),
      prisma.reviewRequest.findMany({
        where: { campaign: { businessId } },
        select: { status: true, channel: true, sentAt: true, customer: {
          select: { firstName: true, lastName: true }
        }, review: { select: { rating: true } }, campaign: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.review.findMany({
        where: { request: { campaign: { businessId } } },
        select: { rating: true },
      }),
      prisma.campaign.count({ where: { businessId } }),
    ]);

    const sent     = requests.filter((r) => ['SENT','CLICKED','REVIEWED'].includes(r.status)).length;
    const clicked  = requests.filter((r) => ['CLICKED','REVIEWED'].includes(r.status)).length;
    const reviewed = requests.filter((r) => r.status === 'REVIEWED').length;
    const failed   = requests.filter((r) => r.status === 'FAILED').length;

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    const byChannel = ['WHATSAPP','EMAIL','SMS'].map((ch) => ({
      channel: ch,
      count: requests.filter((r) => r.channel === ch && r.status !== 'QUEUED').length,
    }));

    const recent = requests.slice(0, 10).map((r) => ({
      name:      `${r.customer.firstName} ${r.customer.lastName || ''}`.trim(),
      channel:   r.channel,
      status:    r.status,
      rating:    r.review?.rating || null,
      campaign:  r.campaign.name,
      sentAt:    r.sentAt,
    }));

    res.json({
      success: true,
      stats: { customers, sent, clicked, reviewed, failed, campaignCount, avgRating },
      byChannel,
      recent,
    });
  } catch (err) { next(err); }
};
