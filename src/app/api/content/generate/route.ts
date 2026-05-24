import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import ContentGenerationLog from "@/models/ContentGenerationLog";
import { generateStructuredContent, GenerateContentRequest } from "@/services/content-ai";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: GenerateContentRequest & { businessId: string } = await req.json();

    if (!body.businessId) {
      return NextResponse.json({ success: false, message: "Missing businessId" }, { status: 400 });
    }

    const aiResult = await generateStructuredContent(body);

    const newPost = await Post.create({
      businessId: body.businessId,
      title: aiResult.title,
      content: aiResult.content,
      keywords: body.keywords,
      location: body.location,
      tone: body.tone,
      contentType: body.content_type,
      hashtags: aiResult.hashtags,
      cta: aiResult.cta,
      seoScore: aiResult.seo_score,
      aiGenerated: true,
      status: "pending_approval",
    });

    await ContentGenerationLog.create({
      businessId: body.businessId,
      requestType: body.content_type,
      prompt: JSON.stringify(body),
      output: JSON.stringify(aiResult),
    });

    return NextResponse.json({
      success: true,
      message: "Content generated successfully.",
      data: newPost,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
