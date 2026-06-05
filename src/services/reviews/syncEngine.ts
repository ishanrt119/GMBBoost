import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import Review from '@/models/Review';
import ReviewAnalytics from '@/models/ReviewAnalytics';
import { fetchAllReviews } from '@/services/google/gbp';
import { analyzeSentiment } from '@/services/reviews/sentimentEngine';
import mongoose from 'mongoose';

/**
 * Core engine to synchronize Google Reviews for a specific business.
 * Can be invoked by API routes (client) or Inngest workers (background).
 */
export async function syncBusinessReviews(businessId: string) {
  await dbConnect();

  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  if (!business.googleLocationId) {
    // Gracefully handle businesses that skipped Google connection during onboarding
    const existingReviews = await Review.find({ businessId: new mongoose.Types.ObjectId(businessId) }).sort({ createdAt: -1 });
    return {
      success: true,
      analytics: await ReviewAnalytics.findOne({ businessId: new mongoose.Types.ObjectId(businessId) }),
      reviews: existingReviews,
      warning: "Missing Google Location ID. Please connect Google Business Profile."
    };
  }

  // Use Google Business Profile API to fetch ALL reviews
  let fetchedReviews: any[] = [];
  
  if (business.googleConnected && business.googleAccessToken) {
    try {
      fetchedReviews = await fetchAllReviews(business);
    } catch (error: any) {
      console.error('GBP Review Sync Error:', error);
    }
  }
  
  const tenantId = business.tenantId || business.organizationId || 'default-tenant';
  let criticalFound = false;

  // 2. Process and Upsert Reviews
  for (const raw of fetchedReviews) {
    const sentimentResult = analyzeSentiment(raw.comment || '', 0);
    
    let label = 'neutral';
    if (raw.starRating === 'ONE' || raw.starRating === 'TWO') label = 'critical';
    else if (raw.starRating === 'FIVE' || raw.starRating === 'FOUR') label = 'positive';
    else if (raw.starRating === 'THREE') label = 'neutral';

    if (label === 'critical') {
      criticalFound = true;
    }

    const numRating = raw.starRating === 'ONE' ? 1 :
                      raw.starRating === 'TWO' ? 2 :
                      raw.starRating === 'THREE' ? 3 :
                      raw.starRating === 'FOUR' ? 4 :
                      raw.starRating === 'FIVE' ? 5 : 0;

    await Review.findOneAndUpdate(
      { googleReviewId: raw.reviewId },
      {
        tenantId,
        organizationId: business.organizationId,
        businessId: new mongoose.Types.ObjectId(businessId),
        googleReviewId: raw.reviewId,
        reviewer: raw.reviewer?.displayName || 'Google User',
        rating: numRating,
        reviewText: raw.comment || '',
        sentiment: label,
        sentimentScore: sentimentResult.score,
        createdAt: new Date(raw.createTime),
        response: raw.reviewReply?.comment || undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 3. Update Analytics
  const allReviews = await Review.find({ businessId: new mongoose.Types.ObjectId(businessId) });
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
    : 0;
  
  const unansweredCount = allReviews.filter(r => !r.response).length;
  const responseRate = totalReviews > 0 
    ? ((totalReviews - unansweredCount) / totalReviews) * 100 
    : 0;

  const positiveReviews = allReviews.filter(r => r.sentiment === 'positive').length;
  const negativeReviews = allReviews.filter(r => r.sentiment === 'negative' || r.sentiment === 'critical').length;
  const overallSentimentScore = totalReviews > 0
    ? allReviews.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0) / totalReviews
    : 0;

  const analytics = await ReviewAnalytics.findOneAndUpdate(
    { businessId: new mongoose.Types.ObjectId(businessId) },
    {
      tenantId,
      organizationId: business.organizationId,
      avgRating: Number(avgRating.toFixed(1)),
      responseRate: Math.round(responseRate),
      sentimentScore: Math.round(overallSentimentScore),
      unansweredCount,
      totalReviews,
      positiveReviews,
      negativeReviews
    },
    { upsert: true, new: true }
  );

  // Optional: trigger Inngest alert if criticalFound
  if (criticalFound) {
    const { inngest } = await import('@/services/inngest/client');
    await inngest.send({
      name: 'reviews/critical-alert',
      data: { businessId }
    });
  }

  return {
    success: true,
    analytics,
    reviews: allReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  };
}
