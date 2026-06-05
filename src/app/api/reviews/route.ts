import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;
    
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || 'all';
    const sort = searchParams.get("sort") || 'newest';
    const page = parseInt(searchParams.get("page") || '1', 10);
    const limit = parseInt(searchParams.get("limit") || '10', 10);
    
    const query: any = { businessId };
    
    if (filter === 'unanswered') query.replyStatus = { $ne: 'POSTED' };
    else if (filter === 'critical') query.sentiment = 'critical';
    else if (filter === '5-star') query.rating = 5;
    else if (filter === 'positive') query.sentiment = 'positive';
    else if (filter === 'negative') query.sentiment = 'negative';

    let sortObj: any = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'highest') sortObj = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortObj = { rating: 1, createdAt: -1 };
    
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      Review.find(query).sort(sortObj).skip(skip).limit(limit),
      Review.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const review = await Review.create(body);
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
