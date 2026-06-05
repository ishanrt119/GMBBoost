import mongoose from 'mongoose';
import AuditHistory from '../../models/AuditHistory';
import Business from '../../models/Business';
import { getGMBProvider } from '../gmb/provider';
import { discoverCompetitors } from './competitorEngine';
import { analyzeProfileCompletion } from './profileEngine';
import { analyzeSEO } from './seoEngine';
import { analyzeReviews } from './reviewEngine';
import { analyzeOpportunities, generateQuickWins } from './opportunityEngine';
import { generateActionPlan, generateExecutiveSummary } from './actionPlanEngine';

export async function runEnterpriseAudit(businessId: string, tenantId: string) {
  // 1. Fetch the business
  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  // 2. Fetch GMB Profile Data
  const gmbProvider = getGMBProvider();
  const businessData = await gmbProvider.fetchBusinessDetails(
    business.name,
    business.formattedAddress || business.address,
    business.googleBusinessProfileUrl,
    businessId
  );

  // 3. Create AuditHistory Record
  const audit = new AuditHistory({
    businessId,
    tenantId,
    auditDate: new Date(),
    status: 'PENDING'
  });
  await audit.save();

  try {
    // Section 1: Snapshot
    audit.snapshot = {
      name: businessData.businessName,
      category: businessData.categories[0] || 'Unknown',
      address: businessData.location,
      phone: business.phone || 'Data Not Available',
      website: business.website || 'Data Not Available',
      rating: businessData.rating,
      reviewCount: businessData.reviewsCount,
      photosCount: businessData.photosCount || null,
      verificationStatus: 'Data Not Available', // GBP API required
      businessAge: null // GBP API required
    };

    // Section 2: Profile Completion
    audit.profileData = analyzeProfileCompletion(businessData);

    // Section 3: GBP SEO Analysis
    audit.seoAnalysis = analyzeSEO(businessData);

    // Section 4: Review Intelligence
    audit.reviewData = analyzeReviews(businessData);

    // Section 5: Real Competitor Discovery Engine
    const { competitors, logs } = await discoverCompetitors(businessData, 2);
    audit.competitors = competitors;
    audit.competitorLogs = logs;

    // Section 6: Rank Tracking (Not Configured placeholder)
    audit.rankTrackingConfigured = false;
    audit.keywordData = [];

    // Section 7 & 8: Posting & Photos
    audit.postingActivity = {
      lastPostDate: null,
      postsLast30Days: null,
      postsLast90Days: null,
      postFrequency: null,
      competitorComparison: 'Data Not Available'
    };

    audit.photoPerformance = {
      photoCount: businessData.photosCount,
      ownerPhotos: null,
      customerPhotos: null,
      recentPhotos: null,
      photoGrowth: null,
      percentileRanking: null
    };

    // Section 9: Local Visibility Opportunities
    audit.opportunities = analyzeOpportunities(audit.profileData, audit.reviewData, businessData);

    // Section 10: Quick Wins
    audit.quickWins = generateQuickWins(audit.opportunities);

    // Section 11 & 12: Action Plan & Executive Summary
    audit.actionPlan = generateActionPlan(audit.quickWins);
    audit.summary = generateExecutiveSummary(audit.quickWins, audit.profileData.completionPercent);

    audit.status = 'COMPLETED';
    await audit.save();

    return audit;

  } catch (error) {
    console.error('Enterprise Audit Failed:', error);
    audit.status = 'FAILED';
    await audit.save();
    throw error;
  }
}
