import mongoose from 'mongoose';
import AuditHistory from '../../models/AuditHistory';
import Business from '../../models/Business';
import { getGMBProvider } from '../gmb/provider';
import { discoverCompetitors } from './competitorEngine';
import { analyzeProfileCompletion } from './profileEngine';
import { analyzeSEO } from './seoEngine';
import { analyzeReviews } from './reviewEngine';
import { generateInsights } from './insightEngine';

export async function runEnterpriseAudit(businessId: string, tenantId: string) {
  // Layer 1: Business Data Layer
  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  const userDefinedCategory = business.userDefinedCategory || 'General';

  const gmbProvider = getGMBProvider();
  const businessData = await gmbProvider.fetchBusinessDetails(
    business.name,
    business.formattedAddress || business.address,
    business.googleBusinessProfileUrl,
    businessId
  );

  const audit = new AuditHistory({
    businessId,
    tenantId,
    auditDate: new Date(),
    status: 'PENDING'
  });
  await audit.save();

  try {
    // 1. Snapshot
    audit.snapshot = {
      name: businessData.businessName,
      category: businessData.categories[0] || 'Unknown',
      address: businessData.location,
      phone: business.phone || 'Data Not Available',
      website: business.website || 'Data Not Available',
      rating: businessData.rating,
      reviewCount: businessData.reviewsCount,
      photosCount: businessData.photosCount || null,
      verificationStatus: 'Data Not Available', 
      businessAge: null 
    };

    // 2. Profile Engine
    audit.profileData = analyzeProfileCompletion(businessData);

    // 3. SEO Engine
    audit.seoAnalysis = analyzeSEO(businessData, userDefinedCategory);

    // 4. Review Engine
    audit.reviewData = analyzeReviews(businessData);

    // 5. Competitor Intelligence Layer (Strict 70% Similarity Model)
    const { competitors, logs, gapAnalysis } = await discoverCompetitors(businessData, 2, userDefinedCategory);
    audit.competitors = competitors;
    audit.competitorLogs = logs;
    audit.competitorGapAnalysis = gapAnalysis;

    // 6. Rank Tracking Engine (Placeholder per spec)
    audit.rankTrackingConfigured = false;
    audit.keywordData = [];

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

    // 7. AI Insight Layer
    const insights = generateInsights(audit.profileData, audit.reviewData, businessData, gapAnalysis);
    
    audit.opportunities = insights.opportunities;
    audit.quickWins = insights.quickWins;
    audit.actionPlan = insights.actionPlan;
    audit.summary = insights.summary;

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
