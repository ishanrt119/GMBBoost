import axios from 'axios';
import { IProfileCompletion, IChecklistItem, IDataQuality, IAuditConfidence, IBusinessIntelligence } from '@/models/Audit';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const BASE_URL = "https://serpapi.com/search.json";

export function calculateProfileCompletion(business: any) {
  const checklist: IChecklistItem[] = [];
  
  const addCheck = (field: string, isComplete: boolean) => {
    checklist.push({ field, status: isComplete ? 'Complete' : 'Missing' });
  };

  addCheck('Business Name', !!business.name);
  addCheck('Primary Category', !!business.category || !!business.userDefinedCategory);
  addCheck('Additional Categories', !!business.keywords && business.keywords.length > 0);
  addCheck('Description', !!business.description && business.description.length > 50);
  addCheck('Services', !!business.services && business.services.length > 0);
  addCheck('Address', !!business.address);
  addCheck('Phone', !!business.phone);
  addCheck('Website', !!business.website);
  addCheck('Business Hours', !!business.hours && Object.keys(business.hours).length > 0);
  addCheck('Photos', !!business.photos && business.photos.length > 0);
  addCheck('Videos', !!business.videos && business.videos.length > 0);
  addCheck('Logo', !!business.logoUrl);
  addCheck('Attributes', !!business.attributes && business.attributes.length > 0);
  addCheck('Appointment Links', !!business.appointmentLinks && business.appointmentLinks.length > 0);
  addCheck('Social Links', !!business.socialLinks && Object.keys(business.socialLinks).length > 0);
  addCheck('WhatsApp Link', !!business.whatsappConfig && business.whatsappConfig.isConnected);
  addCheck('Service Area', !!business.area);

  const completed = checklist.filter(c => c.status === 'Complete').length;
  const completionPercentage = Math.round((completed / checklist.length) * 100);

  return { 
    data: { completionPercentage, checklist },
    evidenceSource: 'Algorithmically calculated from connected Google Business Profile data fields'
  };
}

export function calculateReviewMetrics(reviews: any[]) {
  if (!reviews || reviews.length === 0) {
    return {
      data: {
        reviewCount: 0,
        averageRating: 0,
        reviewsPerWeek: 0,
        responseRate: '0%',
        industryAverage: 4.2
      },
      evidenceSource: 'No reviews found on Google Business Profile'
    };
  }

  const reviewCount = reviews.length;
  const sumRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const averageRating = parseFloat((sumRating / reviewCount).toFixed(1));

  let reviewsPerWeek = 0;
  if (reviewCount > 1) {
    const sorted = [...reviews].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const oldest = new Date(sorted[0].date);
    const newest = new Date(sorted[sorted.length - 1].date);
    const weeksDiff = Math.max(1, (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 7));
    reviewsPerWeek = parseFloat((reviewCount / weeksDiff).toFixed(1));
  } else {
    reviewsPerWeek = 0.5;
  }

  const respondedCount = reviews.filter(r => r.ownerReply).length;
  const responseRate = Math.round((respondedCount / reviewCount) * 100) + '%';

  return {
    data: {
      reviewCount,
      averageRating,
      reviewsPerWeek,
      responseRate,
      industryAverage: 4.2
    },
    evidenceSource: `Aggregated locally from ${reviewCount} live Google Reviews`
  };
}

export async function fetchKeywordRankings(business: any) {
  const categoryLower = (business.category || 'business').toLowerCase();
  const cityLower = (business.city || '').toLowerCase();
  
  let seedWords = [];
  if (business.keywords && business.keywords.length > 0) {
    seedWords = business.keywords;
  } else if (business.services && business.services.length > 0) {
    seedWords = business.services;
  } else {
    seedWords = [categoryLower];
  }

  const keywordsToTest = [
    `${seedWords[0]} ${cityLower}`,
    `best ${seedWords[0]} ${cityLower}`,
    `top ${seedWords[0]} ${cityLower}`,
    `${seedWords[0]} near me`,
    seedWords[1] ? `${seedWords[1]} ${cityLower}` : `${cityLower} ${categoryLower}`
  ].map(k => k.trim());

  const promises = keywordsToTest.map(async (keyword) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { engine: "google_maps", q: keyword, api_key: SERPAPI_KEY },
      });

      const localResults = response.data.local_results || [];
      const rankIndex = localResults.findIndex((r: any) => 
        r.title.toLowerCase().includes(business.name.toLowerCase()) || 
        business.name.toLowerCase().includes(r.title.toLowerCase())
      );

      return {
        keyword,
        rank: rankIndex !== -1 ? rankIndex + 1 : 21,
        sourceQuery: keyword,
        confidence: rankIndex !== -1 ? 'High' : 'Low'
      };
    } catch (err) {
      console.error(`Rank check failed for ${keyword}`);
      return { keyword, rank: 21, sourceQuery: keyword, confidence: 'Low' };
    }
  });

  const results = await Promise.all(promises);
  return { 
    results, 
    evidenceSource: `Live SERP API Data for keywords: ${keywordsToTest.slice(0, 3).join(', ')}` 
  };
}

// ── V7 NATIVE ANALYZERS ────────────────────────────────────────────────────────

export function calculateNativeSeoScore(business: any, profileCompletion: IProfileCompletion) {
  let score = 0;
  const opps: string[] = [];

  const addPoint = (condition: boolean, weight: number, failureOpp: string) => {
    if (condition) score += weight;
    else opps.push(failureOpp);
  };

  addPoint(!!business.description && business.description.length > 100, 25, "Expand Business Description to at least 100 characters");
  addPoint(!!business.category || !!business.userDefinedCategory, 20, "Set a Primary Category");
  addPoint(!!business.keywords && business.keywords.length > 0, 15, "Add Additional Categories / Keywords");
  addPoint(!!business.services && business.services.length > 0, 15, "Populate Service Catalog");
  addPoint(!!business.website, 15, "Link a Website for local authority");
  addPoint(profileCompletion.completionPercentage >= 80, 10, "Improve overall Profile Completion to >80%");

  return {
    score,
    missingKeywords: opps.filter(o => o.includes('Category') || o.includes('Keyword')),
    optimizationOpportunities: opps
  };
}

export function calculateAuditConfidence(
  profileCompletion: number,
  competitorCount: number,
  reviewCount: number,
  hasWebsite: boolean
): IAuditConfidence {
  
  let score = 0;
  const dataQuality: IDataQuality = {
    profileData: profileCompletion > 50 ? 'Complete' : (profileCompletion > 0 ? 'Partial' : 'Unavailable'),
    competitorDiscovery: competitorCount >= 5 ? 'Complete' : (competitorCount > 0 ? 'Partial' : 'Unavailable'),
    keywordDiscovery: 'Complete', // Fetched via SERP
    reviewAnalysis: reviewCount > 0 ? 'Complete' : 'Unavailable',
    websiteAnalysis: hasWebsite ? 'Complete' : 'Unavailable'
  };

  if (dataQuality.profileData === 'Complete') score += 25;
  else if (dataQuality.profileData === 'Partial') score += 12;

  if (dataQuality.competitorDiscovery === 'Complete') score += 25;
  else if (dataQuality.competitorDiscovery === 'Partial') score += 15;

  if (dataQuality.keywordDiscovery === 'Complete') score += 20;

  if (dataQuality.reviewAnalysis === 'Complete') score += 20;

  if (dataQuality.websiteAnalysis === 'Complete') score += 10;

  return {
    dataQuality,
    confidenceScore: score
  };
}

export function generateNativePriorityFixes(business: any, profileCompletion: IProfileCompletion, reviewCount: number, competitors: any[]) {
  const fixes: any[] = [];
  
  const addFix = (condition: boolean, title: string, reason: string) => {
    if (!condition) fixes.push({ title, reason });
  };

  addFix(!!business.description, "Add Business Description", "Missing description hurts local search visibility.");
  addFix(reviewCount > 0, "Launch Review Collection Campaign", "0 reviews found. Competitors with reviews rank much higher.");
  addFix(!!business.services && business.services.length > 0, "Add Service Catalog", "Services list is empty, reducing keyword matches.");
  addFix(!!business.website, "Add Website Link", "A linked website is a major local ranking factor.");
  addFix(!!business.phone, "Add Phone Number", "Customers cannot contact you directly from Google Maps.");
  
  // Dynamic gap fix
  if (competitors.length > 0 && reviewCount > 0) {
    const avgReviews = competitors.reduce((acc, c) => acc + c.reviewCount, 0) / competitors.length;
    if (avgReviews > reviewCount * 2) {
      addFix(false, "Aggressive Review Generation", `Competitors average ${Math.round(avgReviews)} reviews. You need to close the gap to compete.`);
    }
  }

  return fixes;
}

export function calculateBusinessIntelligence(business: any, competitors: any[], reviewCount: number): IBusinessIntelligence {
  const avgReviewCount = competitors.length > 0 ? Math.round(competitors.reduce((acc, c) => acc + c.reviewCount, 0) / competitors.length) : 0;
  const reviewGap = avgReviewCount > reviewCount ? avgReviewCount - reviewCount : 0;
  
  const competitivePosition = reviewCount === 0 ? 'New Entrant / Unestablished' : (reviewCount > avgReviewCount ? 'Market Leader' : 'Challenger');
  const marketSaturation = competitors.length >= 10 ? 'Highly Saturated' : (competitors.length >= 5 ? 'Moderately Competitive' : 'Low Competition');
  const visibilityGap = reviewGap > 50 ? 'Severe visibility gap due to low review volume.' : (reviewGap > 0 ? 'Moderate visibility gap.' : 'Strong visibility.');
  const growthPotential = reviewCount === 0 ? 'High potential with basic optimization.' : 'Incremental growth through consistent review collection.';

  return {
    competitivePosition,
    marketSaturation,
    reviewGap,
    visibilityGap,
    growthPotential
  };
}
