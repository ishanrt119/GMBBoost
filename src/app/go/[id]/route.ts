import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ReviewRequest from "@/models/ReviewRequest";
import Business from "@/models/Business";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Find the review request by customer ID
    // Note: Assuming `id` passed is `customerId` for this mock logic
    const reviewReq = await ReviewRequest.findOne({ customerId: id }).sort({ createdAt: -1 });
    
    if (reviewReq && reviewReq.status !== 'REVIEWED') {
      reviewReq.status = 'CLICKED';
      reviewReq.clickedAt = new Date();
      await reviewReq.save();
    }

    // Default redirect to Google Maps (could be dynamic based on Business DB)
    const business = await Business.findOne();
    const reviewUrl = business?.website || 'https://search.google.com/local/writereview?placeid=mock-place-id';
    
    return NextResponse.redirect(reviewUrl);
  } catch (error) {
    console.error("Tracking redirect error:", error);
    return NextResponse.redirect('https://google.com'); // Fallback
  }
}
