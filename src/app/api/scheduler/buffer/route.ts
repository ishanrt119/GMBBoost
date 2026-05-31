import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // In production, extract tenantId/businessId from auth context
    const tenantId = 'demo-tenant';

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Get posts scheduled within the next 7 days
    const upcomingPosts = await Post.find({
      tenantId,
      status: 'scheduled',
      scheduledDate: { $gte: now, $lte: sevenDaysFromNow }
    }).sort({ scheduledDate: 1 }).lean();

    const uniqueDaysCovered = new Set(
      upcomingPosts.map(p => new Date(p.scheduledDate!).toDateString())
    ).size;

    const missingDays = Math.max(0, 7 - uniqueDaysCovered);
    
    let healthStatus = 'Healthy';
    if (uniqueDaysCovered < 4) healthStatus = 'Critical';
    else if (uniqueDaysCovered < 7) healthStatus = 'Warning';

    // Also get all posts for the calendar view (e.g. past 7 days and future 14 days)
    const calendarStart = new Date(now);
    calendarStart.setDate(now.getDate() - 7);
    const calendarEnd = new Date(now);
    calendarEnd.setDate(now.getDate() + 14);

    const allCalendarPosts = await Post.find({
      tenantId,
      $or: [
        { scheduledDate: { $gte: calendarStart, $lte: calendarEnd } },
        { publishedAt: { $gte: calendarStart, $lte: calendarEnd } },
        { status: 'draft' } // Include all drafts for scheduling
      ]
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        totalScheduledPosts: upcomingPosts.length,
        daysCovered: uniqueDaysCovered,
        healthStatus,
        missingDays,
        upcomingPosts,
        allPosts: allCalendarPosts
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to fetch scheduler buffer:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
