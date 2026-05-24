// src/controllers/review.controller.js
const { prisma } = require('../utils/prisma');

// GET /api/reviews
exports.listReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, minRating, channel } = req.query;
    const businessId = req.user.businessId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await prisma.reviewRequest.findMany({
      where: {
        campaign: { businessId },
        status: 'REVIEWED',
        ...(channel && { channel }),
        ...(minRating && { review: { rating: { gte: parseInt(minRating) } } }),
      },
      include: {
        review: true,
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        campaign: { select: { name: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { reviewedAt: 'desc' },
    });

    const total = await prisma.reviewRequest.count({
      where: { campaign: { businessId }, status: 'REVIEWED' },
    });

    res.json({ success: true, reviews: requests, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

// POST /api/reviews/track  (called from redirect link or webhook)
exports.trackClick = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    await prisma.reviewRequest.update({
      where: { id: requestId },
      data: { status: 'CLICKED', clickedAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/reviews/submit  (manual or from webhook)
exports.submitReview = async (req, res, next) => {
  try {
    const { requestId, rating, text } = req.body;

    await prisma.reviewRequest.update({
      where: { id: requestId },
      data: { status: 'REVIEWED', reviewedAt: new Date() },
    });

    const review = await prisma.review.upsert({
      where: { requestId },
      update: { rating: parseInt(rating), text: text || null, postedAt: new Date() },
      create: { requestId, rating: parseInt(rating), text: text || null, postedAt: new Date() },
    });

    res.json({ success: true, review });
  } catch (err) { next(err); }
};

// GET /api/reviews/stats
exports.reviewStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    const reviews = await prisma.review.findMany({
      where: { request: { campaign: { businessId } } },
      select: { rating: true },
    });

    const total   = reviews.length;
    const avg     = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
    const byRating = [5,4,3,2,1].map((r) => ({ rating: r, count: reviews.filter((v) => v.rating === r).length }));

    res.json({ success: true, stats: { total, avg, byRating } });
  } catch (err) { next(err); }
};
