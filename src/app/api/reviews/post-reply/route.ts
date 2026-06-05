import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Business from '@/models/Business';
import AutomationLog from '@/models/AutomationLog';
import { replyToReview } from '@/services/google/gbp';

export async function POST(req: Request) {
  try {
    const { reviewId, replyText } = await req.json();
    
    if (!reviewId || !replyText) {
      return NextResponse.json({ error: 'reviewId and replyText are required' }, { status: 400 });
    }

    await dbConnect();
    const review = await Review.findById(reviewId);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    if (!review.googleReviewId) {
      return NextResponse.json({ error: 'Review lacks googleReviewId, cannot reply via API.' }, { status: 400 });
    }

    const business = await Business.findById(review.businessId);
    if (!business || !business.googleConnected || !business.googleAccessToken) {
      return NextResponse.json({ error: 'Business is not connected to Google Profile.' }, { status: 400 });
    }

    // Call Real Google Business Profile API
    const result = await replyToReview(business, review.googleReviewId, replyText);

    // Update DB
    review.response = replyText;
    review.replyStatus = 'POSTED';
    await review.save();

    await AutomationLog.create({
      tenantId: review.tenantId || 'demo-tenant',
      businessId: review.businessId.toString(),
      type: 'ai_generation',
      workflow: 'review-reply',
      action: 'post_reply',
      status: 'success',
      message: `Successfully posted reply to review ${review.googleReviewId}`
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Failed to post reply:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
