import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";

export async function GET(req: Request) {
  try {
    await dbConnect();
    // Assuming auth, retrieve the user's business. Without auth middleware, fetch the first one or based on query param
    const business = await Business.findOne();
    if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });
    return NextResponse.json(business);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const business = await Business.create(body);
    return NextResponse.json({ message: "Business created", business }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const business = await Business.findOneAndUpdate({}, body, { new: true });
    return NextResponse.json({ message: "Business updated", business });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
