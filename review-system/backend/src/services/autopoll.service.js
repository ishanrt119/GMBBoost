// src/services/autopoll.service.js
const { prisma } = require('../utils/prisma');
const { logger } = require('../utils/logger');

const AUTO_REVIEW_HOURS = 2; // mark as reviewed after 2 hours of clicking

exports.startAutoPoll = () => {
  logger.info('🔄 Auto-poll service started — checking every 1 hour');

  // Run immediately on startup
  checkAndMarkReviewed();

  // Then run every 1 hour
  setInterval(checkAndMarkReviewed, 60 * 60 * 1000);
};

const checkAndMarkReviewed = async () => {
  try {
    logger.info('🔍 Auto-poll: checking for clicked requests...');

    const twoHoursAgo = new Date(
      Date.now() - AUTO_REVIEW_HOURS * 60 * 60 * 1000
    );

    // Find all requests that were clicked more than 2 hours ago
    // but not yet marked as reviewed
    const clickedRequests = await prisma.reviewRequest.findMany({
      where: {
        status: 'CLICKED',
        clickedAt: {
          lte: twoHoursAgo,
        },
      },
      include: {
        customer: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!clickedRequests.length) {
      logger.info('✅ Auto-poll: no pending reviews found');
      return;
    }

    logger.info(`📝 Auto-poll: found ${clickedRequests.length} requests to mark as reviewed`);

    for (const request of clickedRequests) {
      // Mark request as reviewed
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: {
          status: 'REVIEWED',
          reviewedAt: new Date(),
        },
      });

      // Create review record with default 5 stars
      await prisma.review.upsert({
        where: { requestId: request.id },
        update: {},
        create: {
          requestId: request.id,
          rating: 5,
          text: 'Auto-tracked review',
          postedAt: new Date(),
        },
      });

      const name = `${request.customer.firstName} ${request.customer.lastName || ''}`.trim();
      logger.info(`⭐ Auto-poll: marked ${name} as reviewed`);
    }

    logger.info(`✅ Auto-poll: marked ${clickedRequests.length} reviews successfully`);
  } catch (err) {
    logger.error('❌ Auto-poll error:', err.message);
  }
};