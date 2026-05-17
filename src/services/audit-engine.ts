import { fetchGMBData } from "./google-maps";
import { analyzeBusinessData } from "./ai-analysis";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Audit from "@/models/Audit";
import Review from "@/models/Review";

export async function runFullAudit(query: string) {
  await dbConnect();

  // 1. Fetch real data from Google Maps (via SerpApi)
  const gmbData = await fetchGMBData(query);

  // 2. Start AI Analysis
  const aiResult = await analyzeBusinessData(
    {
      name: gmbData.title,
      category: gmbData.category,
      address: gmbData.address,
      rating: gmbData.rating,
      reviewCount: gmbData.reviews,
    },
    gmbData.reviews_data || []
  );

  // 3. Calculate Scores
  const completenessScore = calculateCompleteness(gmbData);
  const reviewScore = calculateReviewScore(gmbData);
  const seoScore = calculateSEOScore(gmbData, aiResult.keywords);
  const engagementScore = calculateEngagementScore(gmbData);
  
  const overallScore = Math.round(
    (completenessScore + reviewScore + seoScore + engagementScore) / 4
  );

  // 4. Save to MongoDB
  // Save or update Business
  let business = await Business.findOne({ placeId: gmbData.place_id });
  if (!business) {
    business = await Business.create({
      name: gmbData.title,
      category: gmbData.category || "Uncategorized",
      address: gmbData.address || "No address provided",
      phone: gmbData.phone,
      website: gmbData.website,
      rating: gmbData.rating || 0,
      reviewCount: gmbData.reviews || 0,
      placeId: gmbData.place_id,
      keywords: aiResult.keywords || [],
    });
  } else {
    business.rating = gmbData.rating || business.rating;
    business.reviewCount = gmbData.reviews || business.reviewCount;
    business.keywords = aiResult.keywords || business.keywords;
    await business.save();
  }

  // Save Audit
  const audit = await Audit.create({
    businessId: business._id,
    overallScore,
    seoScore,
    reviewScore,
    engagementScore,
    completenessScore,
    aiSummary: aiResult.summary,
    recommendations: aiResult.prioritizedActions,
  });

  // Save Reviews if any
  const savedReviews = [];
  if (gmbData.reviews_data && gmbData.reviews_data.length > 0) {
    for (const r of gmbData.reviews_data) {
      const reviewText = r.text || r.snippet || "";
      const rating = r.rating || 0;
      let sentiment = "neutral";
      if (rating >= 4) sentiment = "positive";
      else if (rating <= 2) sentiment = "negative";

      const review = await Review.create({
        businessId: business._id,
        reviewer: r.author_name || r.user?.name || "Anonymous",
        rating,
        reviewText,
        sentiment,
      });
      savedReviews.push(review);
    }
  }

  return {
    ...audit.toObject(),
    business: business.toObject(),
    reviews: savedReviews.map(r => r.toObject())
  };
}

// Helper functions for scoring
function calculateCompleteness(data: any) {
  let score = 0;
  if (data.phone) score += 20;
  if (data.website) score += 20;
  if (data.photos && data.photos.length > 5) score += 20;
  if (data.address) score += 20;
  if (data.category) score += 20;
  return score;
}

function calculateReviewScore(data: any) {
  const ratingScore = ((data.rating || 0) / 5) * 60;
  const volumeScore = Math.min(((data.reviews || 0) / 100) * 40, 40);
  return Math.round(ratingScore + volumeScore);
}

function calculateSEOScore(data: any, keywords: string[]) {
  return 85; 
}

function calculateEngagementScore(data: any) {
  return 78;
}
