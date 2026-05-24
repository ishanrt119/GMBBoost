import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import ReviewRequest from '@/models/ReviewRequest';
import Review from '@/models/Review';

const AUTO_REVIEW_HOURS = 2; // mark as reviewed after 2 hours of clicking

export async function GET(request: Request) {
  try {
    await connectMongo();
    
    // Auth mechanism for cron jobs in production (e.g. Vercel Cron Secret)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔄 Auto-poll: checking for clicked requests...');

    const twoHoursAgo = new Date(Date.now() - AUTO_REVIEW_HOURS * 60 * 60 * 1000);

    const clickedRequests = await ReviewRequest.find({
      status: 'CLICKED',
      clickedAt: { $lte: twoHoursAgo }
    }).populate('customerId');

    if (!clickedRequests || clickedRequests.length === 0) {
      console.log('✅ Auto-poll: no pending reviews found');
      return NextResponse.json({ success: true, message: 'No pending reviews found' });
    }

    console.log(`📝 Auto-poll: found ${clickedRequests.length} requests to mark as reviewed`);

    for (const req of clickedRequests) {
      req.status = 'REVIEWED';
      req.reviewedAt = new Date();
      await req.save();

      // Ensure businessId exists, fallback to customer businessId if needed
      // If Customer doesn't have businessId properly loaded, we assume single-tenant for now
      // Note: Ideally we'd have a default Business ID.
      let businessId = req.customerId?.businessId || new mongoose.Types.ObjectId();

      await Review.findOneAndUpdate(
        { requestId: req._id },
        {
          $setOnInsert: {
            businessId: businessId,
            requestId: req._id,
            rating: 5,
            reviewText: 'Auto-tracked review',
            reviewer: `${req.customerId?.firstName || 'Customer'} ${req.customerId?.lastName || ''}`.trim(),
            createdAt: new Date(),
          }
        },
        { upsert: true, new: true }
      );

      console.log(`⭐ Auto-poll: marked ${req.customerId?.firstName} as reviewed`);
    }

    console.log(`✅ Auto-poll: marked ${clickedRequests.length} reviews successfully`);
    return NextResponse.json({ success: true, markedCount: clickedRequests.length });

  } catch (err: any) {
    console.error('❌ Auto-poll error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
