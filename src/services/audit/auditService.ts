import dbConnect from '../../lib/mongodb';
import Audit from '../../models/Audit';
import Business from '../../models/Business';
import Review from '../../models/Review';
import { generateAIAudit } from '../ai/auditEngine';

export async function processAuditJob(auditId: string) {
  await dbConnect();

  const audit = await Audit.findById(auditId);
  if (!audit) throw new Error(`Audit not found: ${auditId}`);
  if (audit.status !== 'PENDING') {
    console.log(`Audit ${auditId} is already ${audit.status}`);
    return;
  }

  try {
    const business = await Business.findById(audit.businessId);
    if (!business) throw new Error(`Business not found for audit ${auditId}`);

    // Fetch unified reviews
    const reviewsData = await Review.find({ businessId: business._id }).sort({ createdAt: -1 }).limit(10);
    const formattedReviews = reviewsData.map(r => ({
      author: r.reviewerName || 'Anonymous',
      rating: r.rating || 0,
      text: r.reviewText || '',
      date: r.date?.toISOString() || r.createdAt?.toISOString() || new Date().toISOString(),
      ownerReply: r.replyText,
    }));

    // ── Step 1: Construct business data for Native Analyzers ──
    const businessData = {
      businessName: business.name,
      category: business.userDefinedCategory || business.category || 'Local Business',
      city: business.city || '',
      area: business.area || '',
      state: business.state || '',
      country: business.country || '',
      website: business.website || '',
      phone: business.phone || '',
      description: business.description || '',
      googleMapsUrl: business.googleBusinessProfile || '',
      rating: 0, 
      reviewCount: formattedReviews.length,
      reviews: formattedReviews
    };

    if (formattedReviews.length > 0) {
      const sum = formattedReviews.reduce((acc, rev) => acc + rev.rating, 0);
      businessData.rating = parseFloat((sum / formattedReviews.length).toFixed(1));
    }

    // ── Pre-calculate Analytics Natively ────────────────────
    const { 
      calculateProfileCompletion, 
      calculateReviewMetrics, 
      fetchKeywordRankings,
      calculateNativeSeoScore,
      calculateAuditConfidence,
      generateNativePriorityFixes,
      calculateBusinessIntelligence
    } = require('./seoAnalyzer');

    const profileCompletionPayload = calculateProfileCompletion(business);
    const reviewMetricsPayload = calculateReviewMetrics(formattedReviews);
    
    const profileCompletion = profileCompletionPayload.data;
    const reviewMetrics = reviewMetricsPayload.data;

    let keywordRankings = [];
    let rankingsEvidence = 'Fallback Data (No API Key)';

    if (process.env.SERPAPI_KEY) {
      const rankData = await fetchKeywordRankings(business);
      keywordRankings = rankData.results;
      rankingsEvidence = rankData.evidenceSource;
    } else {
      keywordRankings = [
        { keyword: `${businessData.category} ${business.city}`, rank: 21 },
        { keyword: `best ${businessData.category}`, rank: 21 }
      ];
    }
    
    // Calculate Average Rank
    const avgRank = keywordRankings.reduce((acc: number, curr: any) => acc + curr.rank, 0) / (keywordRankings.length || 1);
    const googleSearchRank = {
      averageRank: parseFloat(avgRank.toFixed(1)),
      topKeywords: keywordRankings
    };

    // ── Competitor Discovery ───────────────────────────────
    const { findCompetitors, isEnterpriseBrand } = require('./competitorService');
    const { accepted, rejected, targetTier, evidenceSource: compEvidence } = await findCompetitors(businessData);

    // V7 Native SEO, Intelligence, and Confidence logic
    const nativeSeoScore = calculateNativeSeoScore(business, profileCompletion);
    const auditConfidence = calculateAuditConfidence(profileCompletion.completionPercentage, accepted.length, formattedReviews.length, !!business.website);
    const nativePriorityFixes = generateNativePriorityFixes(business, profileCompletion, formattedReviews.length, accepted);
    const businessIntelligence = calculateBusinessIntelligence(business, accepted, formattedReviews.length);

    // Save debug info to audit
    audit.metadata = audit.metadata || {};
    audit.metadata.debug = {
      businessName: businessData.businessName,
      category: businessData.category,
      area: businessData.area,
      city: businessData.city,
      reviewCount: businessData.reviewCount,
      tier: targetTier,
      competitorsFound: accepted,
      competitorsRejected: rejected
    };
    await audit.save();

    const enrichedBusinessData = {
      ...businessData,
      tier: targetTier,
      competitors: accepted,
      nativeAnalytics: {
        profileCompletion,
        reviewMetrics,
        googleSearchRank,
        seoScore: nativeSeoScore,
        auditConfidence,
        priorityFixes: nativePriorityFixes,
        businessIntelligence
      }
    };

    // ── Step 2: Full AI analysis ────────────────────────────
    const aiResult = await generateAIAudit(enrichedBusinessData);

    if (aiResult === "Data Unavailable") {
      throw new Error("Data Unavailable");
    }

    // ── Step 3: Merge AI Insights with Native Analytics ──────────────────────────────────────────────
    if (typeof aiResult === 'object') {
      // OVERWRITE the raw data sections with our Native Truths
      aiResult.googleSearchRank = googleSearchRank;
      aiResult.profileCompletion = profileCompletion;
      aiResult.seoScore = nativeSeoScore;
      aiResult.auditConfidence = auditConfidence;
      aiResult.businessIntelligence = businessIntelligence;
      
      // Merge Review Metrics into AI's reviewAnalysis
      aiResult.reviewAnalysis = {
        ...aiResult.reviewAnalysis,
        reviewCount: reviewMetrics.reviewCount,
        averageRating: reviewMetrics.averageRating,
        reviewsPerWeek: reviewMetrics.reviewsPerWeek,
        industryAverage: reviewMetrics.industryAverage,
        responseRate: reviewMetrics.responseRate
      };

      aiResult.businessTier = targetTier;
      aiResult.competitors = accepted; // Save explicitly
      
      // Inject Evidence
      aiResult.evidence = {
        competitors: compEvidence,
        searchRankings: rankingsEvidence,
        profileCompletion: profileCompletionPayload.evidenceSource,
        reviewAnalysis: reviewMetricsPayload.evidenceSource
      };

      // V7 Scoring compilation
      let finalScore = (
        profileCompletion.completionPercentage * 0.4 + 
        nativeSeoScore.score * 0.3 + 
        (formattedReviews.length > 0 ? 30 : 0) // rough review score proxy
      );
      
      if (!aiResult.profileScore) aiResult.profileScore = {};
      aiResult.profileScore.overallScore = Math.round(Math.min(100, finalScore));

      audit.auditVersion   = 'V7';
      audit.overallScore   = aiResult.profileScore.overallScore;
      audit.auditData      = aiResult;
      audit.status         = 'COMPLETED';
    }

    await audit.save();
    console.log(`Successfully processed V7 audit: ${auditId}`);

  } catch (error) {
    console.error(`Failed to process audit ${auditId}:`, error);
    audit.status = 'FAILED';
    if (error instanceof Error) audit.metadata = { error: error.message };
    await audit.save();
    throw error;
  }
}
