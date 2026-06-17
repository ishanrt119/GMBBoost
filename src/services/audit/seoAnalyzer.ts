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

export function calculateSplitProfileScore(business: any, profileCompletion: IProfileCompletion) {
  const completionScore = profileCompletion.completionPercentage;
  
  let seoScore = 0;
  if (business.description && business.description.length > 100) seoScore += 25;
  if (business.category || business.userDefinedCategory) seoScore += 25;
  if (business.keywords && business.keywords.length > 0) seoScore += 25;
  if (business.services && business.services.length > 0) seoScore += 25;

  let engagementScore = 0;
  if (business.reviews && business.reviews.length > 0) engagementScore += 50;
  if (business.photos && business.photos.length > 0) engagementScore += 25;
  if (business.website) engagementScore += 25;

  const overallScore = Math.round((completionScore * 0.4) + (seoScore * 0.4) + (engagementScore * 0.2));

  // Potential Score Engine
  let potentialScore = overallScore;
  let recoverablePoints = 0;
  const breakdown: string[] = [];

  if (engagementScore < 50) {
    recoverablePoints += 20;
    potentialScore += 20;
    breakdown.push("+20 Reviews");
  }
  if (seoScore < 100 && (!business.services || business.services.length === 0)) {
    recoverablePoints += 10;
    potentialScore += 10;
    breakdown.push("+10 Services");
  }
  if (seoScore < 100 && (!business.description || business.description.length < 50)) {
    recoverablePoints += 8;
    potentialScore += 8;
    breakdown.push("+8 Description");
  }
  if (engagementScore < 100 && (!business.photos || business.photos.length === 0)) {
    recoverablePoints += 5;
    potentialScore += 5;
    breakdown.push("+5 Photos");
  }
  if (seoScore < 100 && (!business.keywords || business.keywords.length === 0)) {
    recoverablePoints += 4;
    potentialScore += 4;
    breakdown.push("+4 Categories");
  }

  // Cap potential score at 99
  potentialScore = Math.min(99, potentialScore);

  return {
    completionScore,
    seoScore,
    engagementScore,
    overallScore,
    score: overallScore, // For legacy UI mapping
    potentialScoreAnalysis: {
      potentialScore,
      recoverablePoints,
      breakdown
    }
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

  const cb = { profileData: '0/25', competitors: '0/25', keywords: '20/20', reviews: '0/20', websiteAnalysis: '0/10' };

  if (dataQuality.profileData === 'Complete') { score += 25; cb.profileData = '25/25'; }
  else if (dataQuality.profileData === 'Partial') { score += 12; cb.profileData = '12/25'; }

  if (dataQuality.competitorDiscovery === 'Complete') { score += 25; cb.competitors = '25/25'; }
  else if (dataQuality.competitorDiscovery === 'Partial') { score += 15; cb.competitors = '15/25'; }

  score += 20; // Keyword

  if (dataQuality.reviewAnalysis === 'Complete') { score += 20; cb.reviews = '20/20'; }

  if (dataQuality.websiteAnalysis === 'Complete') { score += 10; cb.websiteAnalysis = '10/10'; }

  return {
    dataQuality,
    confidenceScore: score,
    confidenceBreakdown: cb,
    confidenceCalculationVersion: 'V7.1'
  };
}

export function generateNativeStrengthsWeaknesses(business: any, profileCompletion: IProfileCompletion, reviewCount: number, competitors: any[]) {
  const strengths: any[] = [];
  const weaknesses: any[] = [];

  const compAvg = competitors.length > 0 ? competitors.reduce((acc, c) => acc + c.reviewCount, 0) / competitors.length : 0;

  // STRENGTHS (Deterministic)
  if (business.website) {
    strengths.push({ 
      title: "Website Present", 
      evidence: { metric: "Website Presence", currentValue: "Yes", source: "Business Data" }, 
      impact: "Provides a platform for lead generation and local authority" 
    });
  }
  if (business.googleConnected) {
    strengths.push({ 
      title: "GBP Connected", 
      evidence: { metric: "Integration", currentValue: "Active", source: "Platform Data" }, 
      impact: "Enables direct review management and automated syncs" 
    });
  }
  if (business.category || business.userDefinedCategory) {
    strengths.push({ 
      title: "Category Configured", 
      evidence: { metric: "Primary Category", currentValue: business.category || business.userDefinedCategory, source: "Google Business Profile" }, 
      impact: "Core signal for local search relevance" 
    });
  }
  if (business.address) {
    strengths.push({ 
      title: "Address Present", 
      evidence: { metric: "Location Data", currentValue: "Configured", source: "Google Business Profile" }, 
      impact: "Enables appearance in localized 'near me' searches" 
    });
  }
  if (business.area) {
    strengths.push({ 
      title: "Service Area Configured", 
      evidence: { metric: "Service Zones", currentValue: business.area, source: "Google Business Profile" }, 
      impact: "Expands visibility beyond the immediate physical address" 
    });
  }
  if (competitors.length > 0) {
    strengths.push({ 
      title: "Competitor Discovery Available", 
      evidence: { metric: "Competitor Baseline", currentValue: `${competitors.length} Found`, source: "Local Market Analysis" }, 
      impact: "Allows data-driven strategy and benchmarking" 
    });
  }

  if (profileCompletion.completionPercentage > 80) {
    strengths.push({ 
      title: "High Profile Completion", 
      evidence: { metric: "Profile Completion", currentValue: profileCompletion.completionPercentage, source: "Internal Analysis" }, 
      impact: "Google favors complete profiles for local pack rankings" 
    });
  }
  if (reviewCount > 20) {
    strengths.push({ 
      title: "Established Review Base", 
      evidence: { metric: "Review Count", currentValue: reviewCount, competitorAverage: Math.round(compAvg), source: "Google Maps Reviews" }, 
      impact: "Builds immediate trust with potential customers" 
    });
  }
  if (business.services && business.services.length > 5) {
    strengths.push({ 
      title: "Detailed Service Catalog", 
      evidence: { metric: "Listed Services", currentValue: business.services.length, source: "Google Business Profile" }, 
      impact: "Increases visibility for specific long-tail service searches" 
    });
  }

  // WEAKNESSES
  if (reviewCount === 0) {
    weaknesses.push({ 
      title: "No Reviews", 
      evidence: { metric: "Review Count", currentValue: 0, competitorAverage: Math.round(compAvg), source: "Google Maps Reviews" }, 
      risk: "Severe lack of trust and visibility compared to local competitors",
      outcome: `Acquire first 20 reviews to reach local market average`
    });
  }
  if (!business.description || business.description.length < 50) {
    weaknesses.push({ 
      title: "Thin Business Description", 
      evidence: { metric: "Description Length", currentValue: business.description?.length || 0, source: "Google Business Profile" }, 
      risk: "Missed opportunity for keyword optimization and customer conversion",
      outcome: "Write comprehensive 750-character SEO description"
    });
  }
  if (!business.services || business.services.length === 0) {
    weaknesses.push({ 
      title: "Missing Service Menu", 
      evidence: { metric: "Service Count", currentValue: 0, source: "Google Business Profile" }, 
      risk: "Google cannot match your profile to specific service queries",
      outcome: "Populate full service catalog to capture long-tail keywords"
    });
  }
  if (profileCompletion.completionPercentage < 50) {
    weaknesses.push({ 
      title: "Incomplete Profile", 
      evidence: { metric: "Profile Completion", currentValue: profileCompletion.completionPercentage, source: "Internal Analysis" }, 
      risk: "Google is likely to rank fully optimized competitors above you",
      outcome: "Complete all missing basic business information fields"
    });
  }

  return { strengths, weaknesses };
}

export function generateNativePriorityFixes(business: any, profileCompletion: IProfileCompletion, reviewCount: any, competitors: any[]) {
  const fixes: any[] = [];
  const compAvg = competitors.length > 0 ? competitors.reduce((acc, c) => acc + c.reviewCount, 0) / competitors.length : 0;
  
  const addFix = (condition: boolean, title: string, reason: string, impact: string, effort: string, expectedScoreGain: number, metric: string, currentValue: any) => {
    if (!condition) {
      fixes.push({ 
        title, 
        reason, 
        impact, 
        effort, 
        expectedScoreGain,
        evidence: { metric, currentValue, competitorAverage: Math.round(compAvg), source: "Internal Analysis" }
      });
    }
  };

  const reviewGain = Math.min(20, Math.max(5, Math.round((compAvg - reviewCount) / 3)));
  addFix(
    reviewCount > 0,
    "No Reviews",
    "Zero reviews means you will not rank in the local pack and customers will not trust your listing.",
    "Critical",
    "High",
    reviewGain,
    "Review Count",
    0
  );

  const missingDescLength = 750 - (business.description?.length || 0);
  const descGain = Math.min(10, Math.max(2, Math.round(missingDescLength / 100)));
  addFix(
    !!business.description && business.description.length >= 50,
    "Thin Business Description",
    "Google relies on the business description to understand your services and match you to search queries.",
    "High",
    "Low",
    descGain,
    "Description Length",
    business.description?.length || 0
  );

  const missingServices = 5 - (business.services?.length || 0);
  const serviceGain = Math.min(15, Math.max(3, missingServices * 2));
  addFix(
    !!business.services && business.services.length > 0,
    "Missing Service Menu",
    "A blank service menu prevents Google from surfacing your profile for specific, high-intent service keywords.",
    "High",
    "Low",
    serviceGain,
    "Service Count",
    business.services?.length || 0
  );

  addFix(!!business.website, "Add Website Link", "A linked website is a major local ranking factor.", "High", "High", 15, "Website URL", "Missing");
  addFix(!!business.phone, "Add Phone Number", "Customers cannot contact you directly from Google Maps.", "High", "Low", 5, "Phone Number", "Missing");
  
  // Dynamic gap fix
  if (competitors.length > 0 && reviewCount > 0) {
    if (compAvg > reviewCount * 2) {
      addFix(false, "Aggressive Review Generation Campaign", `Competitors average ${Math.round(compAvg)} reviews. You need to close the gap to compete.`, "High", "High", Math.round(Math.min(20, (compAvg - reviewCount) / 5)), "Review Gap", reviewCount);
    }
  }

  // Sort by expected score gain (highest first), then impact
  fixes.sort((a, b) => b.expectedScoreGain - a.expectedScoreGain);

  return fixes;
}

export function generateNativeRoadmaps(priorityFixes: any[], business: any, reviewCount: number) {
  const thirtyDayPlan: any[] = [];
  const ninetyDayPlan: any[] = [];

  // PREREQUISITE ENGINE
  const pendingTasks = [...priorityFixes];
  const firstMonthTasks: any[] = [];
  const immediateFixes: any[] = [];
  
  if (reviewCount === 0) {
    firstMonthTasks.push({
      objective: "Collect First Reviews",
      tasks: ["Generate unique review link", "Send requests to 10 past clients", "Setup automated review capture"],
      expectedScoreGain: 20
    });
  } else if (!business.website) {
    firstMonthTasks.push({
      objective: "Add Website Link",
      tasks: ["Create basic landing page", "Link website to GBP", "Verify domain ownership"],
      expectedScoreGain: 15
    });
  }

  if (!business.services || business.services.length === 0) {
    firstMonthTasks.push({
      objective: "Add Service Catalog",
      tasks: ["Audit competitors for missing services", "Map out 5-10 core services", "Publish to profile"],
      expectedScoreGain: 10
    });
  } else if (!business.description || business.description.length < 50) {
    firstMonthTasks.push({
      objective: "Write 750-character GBP Description",
      tasks: ["Keyword research for description", "Draft optimized copy", "Publish description"],
      expectedScoreGain: 8
    });
  }

  // Map immediate short-term fixes to Thirty Day Plan (Weeks 1-4)
  for (const fix of pendingTasks) {
    if (immediateFixes.length >= 4) break;
    if (!fix?.title) continue;
    if (!firstMonthTasks.find(t => t.objective === fix.title)) {
      immediateFixes.push({
        objective: fix.title,
        tasks: [`Audit current ${fix.title.toLowerCase()} status`, `Execute standard operating procedure`, `Verify changes are published`],
        expectedScoreGain: fix.expectedScoreGain
      });
    }
  }

  immediateFixes.forEach((t, index) => {
    thirtyDayPlan.push({ week: `Week ${index + 1}`, objective: t.objective, tasks: t.tasks, expectedScoreGain: t.expectedScoreGain });
  });

  // Map remaining to 90 Day Plan
  const remainingTasks = pendingTasks.filter(f => !firstMonthTasks.find(t => t.objective === f.title) && !immediateFixes.find(t => t.objective === f.title));
  
  if (firstMonthTasks.length > 0) {
    ninetyDayPlan.push({
      month: 'Month 1',
      objective: firstMonthTasks[0].objective,
      tasks: firstMonthTasks[0].tasks,
      expectedScoreGain: firstMonthTasks[0].expectedScoreGain
    });
  } else {
    const focusFix = remainingTasks.shift() || { title: "Continuous Review Generation", expectedScoreGain: 5 };
    ninetyDayPlan.push({
      month: 'Month 1',
      objective: `Scale: ${focusFix.title}`,
      tasks: [`Review performance metrics`, `Optimize workflow for ${focusFix.title}`, `Monitor competitor movement`],
      expectedScoreGain: focusFix.expectedScoreGain
    });
  }

  const months = ['Month 2', 'Month 3'];
  months.forEach((month) => {
    const focusFix = remainingTasks.shift() || { title: "Continuous Review Generation", expectedScoreGain: 5 };
    ninetyDayPlan.push({
      month,
      objective: `Scale: ${focusFix.title}`,
      tasks: [`Review performance metrics`, `Optimize workflow for ${focusFix.title}`, `Monitor competitor movement`],
      expectedScoreGain: focusFix.expectedScoreGain
    });
  });

  return { thirtyDayPlan, ninetyDayPlan };
}

export function calculateBusinessIntelligence(business: any, competitors: any[], reviewCount: number): IBusinessIntelligence {
  const avgReviewCount = competitors.length > 0 ? Math.round(competitors.reduce((acc, c) => acc + c.reviewCount, 0) / competitors.length) : 0;
  const reviewGap = avgReviewCount > reviewCount ? avgReviewCount - reviewCount : 0;
  
  // Deterministic Text Generation
  const competitivePosition = reviewCount === 0 
    ? `Business is a new entrant with 0 reviews in a market averaging ${avgReviewCount} reviews.` 
    : (reviewCount > avgReviewCount 
        ? `Market Leader. Business has ${reviewCount} reviews, beating the competitor average of ${avgReviewCount}.` 
        : `Challenger. Business has ${reviewCount} reviews, trailing the competitor average of ${avgReviewCount}.`);
        
  const marketSaturation = competitors.length >= 10 
    ? `Highly Saturated. Found 10+ active competitors in the immediate service area.` 
    : (competitors.length >= 5 
        ? `Moderately Competitive. Found ${competitors.length} established competitors nearby.` 
        : `Low Competition. Discovered less than 5 major competitors in this category locally.`);
        
  const visibilityGap = reviewGap > 50 
    ? `Severe visibility gap. The business needs ${reviewGap} more reviews to reach parity with local competitors.` 
    : (reviewGap > 0 
        ? `Moderate visibility gap. Need ${reviewGap} reviews to match competitor average.` 
        : `Strong visibility. The business profile review volume exceeds the local baseline.`);
        
  const growthPotential = reviewCount === 0 
    ? `High immediate potential. Activating basic profile features and generating 10 reviews will yield massive ROI.` 
    : `Incremental growth. Maintaining a steady review velocity will cement the current ranking position.`;

  return {
    competitivePosition,
    marketSaturation,
    reviewGap,
    visibilityGap,
    growthPotential
  };
}
