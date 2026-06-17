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

    const actualReviewCount = Math.max(business.reviewCount || 0, formattedReviews.length || 0);

    // [DATA QUALITY] Sync Validation
    console.log('[DATA QUALITY] Sync Validation:');
    console.log(`- Business Name: ${business.name}`);
    console.log(`- Stored Place ID: ${business.googlePlaceId || business.placeId || 'Missing'}`);
    console.log(`- Google Review Count: ${business.reviewCount || 0}`);
    console.log(`- Mongo Review Count: ${formattedReviews.length}`);
    console.log(`- Connected Account Status: ${business.googleConnected}`);

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
      rating: business.rating || 0, 
      reviewCount: actualReviewCount,
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
      calculateSplitProfileScore,
      calculateAuditConfidence,
      generateNativePriorityFixes,
      calculateBusinessIntelligence,
      generateNativeStrengthsWeaknesses,
      generateNativeRoadmaps
    } = require('./seoAnalyzer');

    const profileCompletionPayload = calculateProfileCompletion(business);
    const reviewMetricsPayload = calculateReviewMetrics(formattedReviews);
    
    const profileCompletion = profileCompletionPayload.data;
    const reviewMetrics = reviewMetricsPayload.data;

    let keywordRankings = [];
    let rankingsEvidence = 'Fallback Data (No API Key)';

    if (process.env.SERPAPI_KEY) {
      try {
        const rankData = await fetchKeywordRankings(business);
        keywordRankings = rankData.results;
        rankingsEvidence = rankData.evidenceSource;
      } catch (err) {
        console.error("SERP API Failed, falling back to generated keywords");
      }
    } 
    
    if (keywordRankings.length === 0) {
      // 10 Keyword Fallback
      const s1 = business.services?.[0] || 'Services';
      const s2 = business.services?.[1] || 'Company';
      const s3 = business.services?.[2] || 'Experts';
      
      const cat = businessData.category || 'Business';
      const cit = businessData.city || 'Local Area';
      const bname = businessData.businessName || 'Company';

      keywordRankings = [
        { keyword: `${cat} in ${cit}`, rank: 21 },
        { keyword: `${bname} ${cit}`, rank: 21 },
        { keyword: `${s1} ${cit}`, rank: 21 },
        { keyword: `${s2} ${cit}`, rank: 21 },
        { keyword: `${s3} ${cit}`, rank: 21 },
        { keyword: `Best ${cat} ${cit}`, rank: 21 },
        { keyword: `Top ${cat} ${cit}`, rank: 21 },
        { keyword: `${cat} near me`, rank: 21 },
        { keyword: `Local ${cat} ${cit}`, rank: 21 },
        { keyword: `${cat} company ${cit}`, rank: 21 }
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

    const splitProfileScore = calculateSplitProfileScore(business, profileCompletion);
    const auditConfidence = calculateAuditConfidence(profileCompletion.completionPercentage, accepted.length, actualReviewCount, !!business.website);
    const nativePriorityFixes = generateNativePriorityFixes(business, profileCompletion, actualReviewCount, accepted);
    const businessIntelligence = calculateBusinessIntelligence(business, accepted, actualReviewCount);
    const { strengths, weaknesses } = generateNativeStrengthsWeaknesses(business, profileCompletion, actualReviewCount, accepted);
    const { thirtyDayPlan, ninetyDayPlan } = generateNativeRoadmaps(nativePriorityFixes, business, actualReviewCount);

    // [DATA QUALITY] Master Audit Generation Logging
    const compAvg = accepted.length > 0 ? accepted.reduce((acc: number, c: any) => acc + c.reviewCount, 0) / accepted.length : 0;
    console.log('[DATA QUALITY] Master Audit Generation:');
    console.log(`- reviewCount: ${actualReviewCount}`);
    console.log(`- averageRating: ${businessData.rating}`);
    console.log(`- profileCompletion: ${profileCompletion.completionPercentage}`);
    console.log(`- serviceCount: ${business.services?.length || 0}`);
    console.log(`- descriptionLength: ${business.description?.length || 0}`);
    console.log(`- competitorAverageReviews: ${Math.round(compAvg)}`);
    console.log(`- generatedStrengths: ${strengths.map((s: any) => s.title).join(', ')}`);
    console.log(`- generatedWeaknesses: ${weaknesses.map((w: any) => w.title).join(', ')}`);
    console.log(`- priorityFixes: ${nativePriorityFixes.map((f: any) => `${f.title} (+${f.expectedScoreGain})`).join(', ')}`);

    // Dynamic Quick Wins and Growth Opportunities
    const quickWins = nativePriorityFixes.filter((f: any) => f.effort === 'Low').slice(0, 3).map((f: any) => f.title);
    const growthOpportunities = weaknesses.map((w: any) => w.outcome || w.title);

    // Weighted Overall Score calculation (Math Coalescing)
    const ratingComponent = ((reviewMetrics.averageRating || businessData.rating || 0) / 5) * 70;
    const reviewCompScore = Math.min(100, (Math.log10(actualReviewCount + 1) * 30) + ratingComponent);
    const safeAvgRank = googleSearchRank.averageRank || 21;
    const rankMapScore = Math.max(0, 100 - (safeAvgRank * 2));
    const finalOverallScore = Math.min(100, Math.max(1, Math.round(
      ((splitProfileScore.completionScore || 0) * 0.25) +
      ((splitProfileScore.seoScore || 0) * 0.25) +
      (reviewCompScore * 0.30) +
      (rankMapScore * 0.20)
    )));

    // Score Pipeline Debug Logging
    console.log(`[AUDIT ${auditId}] SCORE PIPELINE:`);
    console.log(`- Profile Score: ${splitProfileScore.completionScore}`);
    console.log(`- SEO Score: ${splitProfileScore.seoScore}`);
    console.log(`- Review Score: ${reviewCompScore.toFixed(1)}`);
    console.log(`- Search Rank Score: ${rankMapScore.toFixed(1)}`);
    console.log(`- FINAL OVERALL SCORE: ${finalOverallScore}`);

    // Audit Status Tiers
    let auditStatus: 'COMPLETED' | 'PARTIAL' | 'INSUFFICIENT_DATA' = 'COMPLETED';
    if (auditConfidence.confidenceScore < 40) {
      auditStatus = 'INSUFFICIENT_DATA';
    } else if (auditConfidence.confidenceScore < 75) {
      auditStatus = 'PARTIAL';
    }

    // Snapshot versioning
    audit.metadata = audit.metadata || {};
    audit.metadata.auditSnapshot = {
      reviewCount: formattedReviews.length,
      averageRating: reviewMetrics.averageRating,
      profileScore: splitProfileScore.completionScore,
      seoScore: splitProfileScore.seoScore,
      rankScore: Math.round(rankMapScore),
      competitorCount: accepted.length,
      generatedAt: new Date().toISOString()
    };
    
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

    let aiResult: any = {};

    if (auditStatus !== 'INSUFFICIENT_DATA') {
      const enrichedBusinessData = {
        ...businessData,
        tier: targetTier,
        competitors: accepted,
        nativeAnalytics: {
          profileCompletion,
          reviewMetrics,
          googleSearchRank,
          seoScore: { score: splitProfileScore.seoScore, missingKeywords: [], optimizationOpportunities: [] }, // Legacy compat
          auditConfidence,
          priorityFixes: nativePriorityFixes,
          businessIntelligence
        }
      };

      // ── Step 2: Full AI analysis ────────────────────────────
      aiResult = await generateAIAudit(enrichedBusinessData);

      if (aiResult === "Data Unavailable") {
        throw new Error("Data Unavailable");
      }
    }

    // ── Step 3: Merge AI Insights with Native Analytics ──────────────────────────────────────────────
    if (typeof aiResult === 'object') {
      aiResult.googleSearchRank = googleSearchRank;
      aiResult.profileCompletion = profileCompletion;
      aiResult.seoScore = { score: splitProfileScore.seoScore, missingKeywords: [], optimizationOpportunities: [] };
      aiResult.auditConfidence = auditConfidence;
      aiResult.businessIntelligence = businessIntelligence;
      aiResult.strengths = strengths;
      aiResult.quickWins = quickWins;
      
      if (auditStatus !== 'INSUFFICIENT_DATA') {
        aiResult.weaknesses = weaknesses;
        aiResult.priorityFixes = nativePriorityFixes;
        aiResult.thirtyDayPlan = thirtyDayPlan;
        aiResult.ninetyDayPlan = ninetyDayPlan;
        aiResult.growthOpportunities = growthOpportunities;
      }
      
      aiResult.reviewAnalysis = {
        ...(aiResult.reviewAnalysis || {}),
        reviewCount: reviewMetrics.reviewCount,
        averageRating: reviewMetrics.averageRating,
        reviewsPerWeek: reviewMetrics.reviewsPerWeek,
        industryAverage: reviewMetrics.industryAverage,
        responseRate: reviewMetrics.responseRate
      };

      aiResult.businessTier = targetTier;
      aiResult.competitors = accepted; 
      
      aiResult.evidence = {
        competitors: compEvidence,
        searchRankings: rankingsEvidence,
        profileCompletion: profileCompletionPayload.evidenceSource,
        reviewAnalysis: reviewMetricsPayload.evidenceSource
      };

      aiResult.profileScore = splitProfileScore;

      audit.auditVersion   = 'V7.2';
      audit.overallScore   = finalOverallScore;
      audit.auditData      = aiResult;
      audit.status         = auditStatus;
      
      console.log(`[AUDIT ${auditId}] Final Payload:`, JSON.stringify({
        overallScore: finalOverallScore,
        profileScore: splitProfileScore,
        searchRankingsCount: aiResult.googleSearchRank?.topKeywords?.length,
        competitorsCount: aiResult.competitors?.length,
        roadmapMonth1: aiResult.ninetyDayPlan?.[0]?.objective
      }, null, 2));
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
