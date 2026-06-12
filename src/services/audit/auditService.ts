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

    // ── Step 1: Construct business data for Groq ──────────────────
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

    // Calculate average rating if there are reviews
    if (formattedReviews.length > 0) {
      const sum = formattedReviews.reduce((acc, rev) => acc + rev.rating, 0);
      businessData.rating = parseFloat((sum / formattedReviews.length).toFixed(1));
    }

    // ── Competitor Discovery ───────────────────────────────
    const { findCompetitors, isEnterpriseBrand } = require('./competitorService');
    const { accepted, rejected, targetTier } = await findCompetitors(businessData);

    // DEBUG FIRST
    console.log("==========================================");
    console.log("AUDIT DEBUG INFO");
    console.log(`Business: ${businessData.businessName}`);
    console.log(`Category: ${businessData.category}`);
    console.log(`Area: ${businessData.area}`);
    console.log(`City: ${businessData.city}`);
    console.log(`Reviews: ${businessData.reviewCount}`);
    console.log(`Tier: ${targetTier}`);
    console.log(`Competitors Returned:`, accepted.map((c: any) => c.name));
    console.log("==========================================");

    // Fail Audit if Enterprise slips through and target is not enterprise
    const targetIsEnterprise = isEnterpriseBrand(businessData.businessName, businessData.reviewCount);
    if (!targetIsEnterprise) {
      const enterpriseFound = accepted.some((c: any) => isEnterpriseBrand(c.name, c.reviewCount));
      if (enterpriseFound) {
        throw new Error("Competitor Selection Failed: Enterprise brand detected for local business.");
      }
    }

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
    await audit.save(); // Save debug info early so it's accessible even if AI fails

    const enrichedBusinessData = {
      ...businessData,
      tier: targetTier,
      competitors: accepted
    };

    // ── Step 2: Full AI analysis ────────────────────────────
    const aiResult = await generateAIAudit(enrichedBusinessData);

    if (aiResult === "Data Unavailable") {
      throw new Error("Data Unavailable");
    }

    // ── Step 3: Save everything ──────────────────────────────────────────────
    if (typeof aiResult === 'object') {
      audit.overallScore   = aiResult.overallScore;
      audit.auditData      = aiResult;
      audit.auditData.businessTier = targetTier;
      audit.status         = 'COMPLETED';
    }

    await audit.save();
    console.log(`Successfully processed audit: ${auditId}`);

  } catch (error) {
    console.error(`Failed to process audit ${auditId}:`, error);
    audit.status = 'FAILED';
    if (error instanceof Error) audit.metadata = { error: error.message };
    await audit.save();
    throw error;
  }
}
