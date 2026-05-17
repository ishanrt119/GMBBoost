import { NextResponse } from "next/server";
import { runFullAudit } from "@/services/audit-engine";
import dbConnect from "@/lib/mongodb";
import Audit from "@/models/Audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Business query or URL is required" },
        { status: 400 }
      );
    }

    // Runs audit, fetches Google Maps data, analyzes with AI, and stores in MongoDB
    const audit = await runFullAudit(query);

    return NextResponse.json(audit);
  } catch (error: any) {
    console.error("Audit API Error Details:", {
      message: error.message,
      status: error.response?.status,
    });
    
    return NextResponse.json(
      { error: error.message || "Failed to run audit" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    
    let audits;
    if (businessId) {
      audits = await Audit.find({ businessId }).sort({ createdAt: -1 }).populate('businessId');
    } else {
      audits = await Audit.find({}).sort({ createdAt: -1 }).populate('businessId');
    }

    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
