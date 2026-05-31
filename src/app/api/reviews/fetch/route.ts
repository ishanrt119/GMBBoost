import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import ReviewAnalytics from '@/models/ReviewAnalytics';
import { googleProvider } from '@/services/reviews/providers/MockGoogleProvider';
import { analyzeSentiment } from '@/services/reviews/sentimentEngine';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  process.env.INNGEST_DEV = "1";
  process.env.INNGEST_EVENT_KEY = process.env.INNGEST_EVENT_KEY || "local";
  
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch from Provider
    const fetchedReviews = await googleProvider.fetchReviews(businessId);
    
    const tenantId = 'demo-tenant'; // Mock multi-tenant ID
    let criticalFound = false;

    // 2. Process and Upsert Reviews
    for (const raw of fetchedReviews) {
      const sentimentResult = analyzeSentiment(raw.text, raw.rating);
      
      if (sentimentResult.label === 'critical') {
        criticalFound = true;
      }

      await Review.findOneAndUpdate(
        { providerReviewId: raw.providerReviewId },
        {
          tenantId,
          businessId: new mongoose.Types.ObjectId(businessId),
          providerReviewId: raw.providerReviewId,
          reviewer: raw.reviewerName,
          rating: raw.rating,
          reviewText: raw.text,
          sentiment: sentimentResult.label,
          sentimentScore: sentimentResult.score,
          createdAt: new Date(raw.postedAt),
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

    // Optional: trigger Inngest alert if criticalFound (handled by cron typically, but good here too)
    if (criticalFound) {
      const { inngest } = await import('@/services/inngest/client');
      await inngest.send({
        name: 'reviews/critical-alert',
        data: { businessId }
      });
    }

    return NextResponse.json({ success: true, analytics, reviews: allReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) });
  } catch (error: any) {
    console.error('Failed to sync reviews:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
