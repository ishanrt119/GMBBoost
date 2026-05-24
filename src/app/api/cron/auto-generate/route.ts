import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import Business from "@/models/Business";
import { generateStructuredContent } from "@/services/content-ai";

export async function GET(req: Request) {
  try {
    // Only allow cron requests based on an authorization header or internal secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Find businesses that have fewer than 2 scheduled posts in the next 7 days
    const businesses = await Business.find({});
    let generatedCount = 0;

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    for (const business of businesses) {
      const scheduledPostsCount = await Post.countDocuments({
        businessId: business._id,
        status: "scheduled",
        scheduledDate: { $lte: nextWeek }
      });

      if (scheduledPostsCount < 2) {
        // Trigger auto-generation
        try {
          const aiResult = await generateStructuredContent({
            business_name: business.name,
            business_type: business.category || "General Business",
            location: business.address || "Local Area",
            keywords: [], // Could fetch from a settings model
            tone: "professional",
            content_type: "gmb_post",
          });

          await Post.create({
            businessId: business._id,
            title: aiResult.title,
            content: aiResult.content,
            hashtags: aiResult.hashtags,
            cta: aiResult.cta,
            seoScore: aiResult.seo_score,
            aiGenerated: true,
            status: "pending_approval",
          });
          generatedCount++;
        } catch (error) {
          console.error(`Failed to auto-generate for business ${business._id}`, error);
        }
      }
    }

    return NextResponse.json({ success: true, message: `Auto-generated ${generatedCount} posts.` });
  } catch (error: any) {
    console.error("Cron Auto-Generate Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
