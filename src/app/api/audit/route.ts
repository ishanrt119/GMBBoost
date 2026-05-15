import { NextResponse } from "next/server";
import { runFullAudit } from "@/services/audit-engine";

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

    // This now returns an in-memory object, no database used
    const audit = await runFullAudit(query);

    return NextResponse.json(audit);
  } catch (error: any) {
    console.error("Audit API Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    const statusCode = error.response?.status === 401 ? 401 : 500;
    const errorMessage = error.response?.status === 401 
      ? `Authentication Failed: Please check your ${error.config?.url?.includes('serpapi') ? 'SERPAPI_KEY' : 'GROQ_API_KEY'} in .env`
      : error.message || "Failed to run audit";

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
