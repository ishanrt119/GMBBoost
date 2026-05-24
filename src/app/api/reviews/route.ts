import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const replyStatus = searchParams.get("replyStatus");
    const sentiment = searchParams.get("sentiment");
    
    let query: any = {};
    if (businessId) query.businessId = businessId;
    if (replyStatus) query.replyStatus = replyStatus;
    if (sentiment) query.sentiment = sentiment;
    
    const reviews = await Review.find(query).sort({ createdAt: -1 }).populate('businessId', 'name');
    return NextResponse.json(reviews);
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
