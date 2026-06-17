import { IAudit } from '@/models/Audit';

/**
 * Validates critical canonical fields before adapter transformations.
 */
function validateCanonicalAudit(audit: IAudit, adapterName: string) {
  const data = audit.auditData || {} as any;
  const missing = [];

  if (audit.overallScore === undefined) missing.push('overallScore');
  if (!data.profileScore) missing.push('profileScore');
  if (!data.competitors) missing.push('competitors');
  if (!data.googleSearchRank?.topKeywords) missing.push('googleSearchRank.topKeywords');
  if (!data.thirtyDayPlan) missing.push('thirtyDayPlan');
  if (!data.ninetyDayPlan) missing.push('ninetyDayPlan');

  if (missing.length > 0) {
    console.error(`[${adapterName}] Validation Warning: Missing canonical fields:`, missing.join(', '));
  }
}

/**
 * @deprecated Use auditToV7Adapter for modern components.
 * Adapts the canonical schema to the legacy V5 Dashboard expectations.
 */
export function auditToV5Adapter(audit: IAudit): IAudit {
  validateCanonicalAudit(audit, 'auditToV5Adapter');
  
  // Create a deep copy to avoid mutating the original prop
  const adapted = JSON.parse(JSON.stringify(audit));
  const data = adapted.auditData || {};

  // Inject aliases required by V5
  data.overallScore = adapted.overallScore;
  data.topKeywords = data.googleSearchRank?.topKeywords || [];
  
  if (data.googleSearchRank) {
    data.googleSearchRank.score = data.googleSearchRank.averageRank || 21;
  }
  
  if (data.reviewAnalysis && typeof data.reviewAnalysis.reviewCount === 'number') {
    const ratingComponent = ((data.reviewAnalysis.averageRating || 0) / 5) * 70;
    const reviewCompScore = Math.min(100, (Math.log10(data.reviewAnalysis.reviewCount + 1) * 30) + ratingComponent);
    data.reviewAnalysis.score = Math.round(reviewCompScore);
  }

  adapted.auditData = data;
  return adapted;
}

/**
 * @deprecated Use auditToV7Adapter for modern components.
 * Adapts the canonical schema to the V6 Dashboard expectations.
 */
export function auditToV6Adapter(audit: IAudit): IAudit {
  validateCanonicalAudit(audit, 'auditToV6Adapter');
  
  const adapted = JSON.parse(JSON.stringify(audit));
  const data = adapted.auditData || {};

  if (data.googleSearchRank) {
    data.googleSearchRank.score = data.googleSearchRank.averageRank || 21;
  }
  
  if (data.reviewAnalysis && typeof data.reviewAnalysis.reviewCount === 'number') {
    const ratingComponent = ((data.reviewAnalysis.averageRating || 0) / 5) * 70;
    const reviewCompScore = Math.min(100, (Math.log10(data.reviewAnalysis.reviewCount + 1) * 30) + ratingComponent);
    data.reviewAnalysis.score = Math.round(reviewCompScore);
  }

  adapted.auditData = data;
  return adapted;
}

/**
 * Adapts the canonical schema to the modern V7 UI expectations.
 */
export function auditToV7Adapter(audit: IAudit): IAudit {
  validateCanonicalAudit(audit, 'auditToV7Adapter');
  
  const adapted = JSON.parse(JSON.stringify(audit));
  const data = adapted.auditData || {};

  // Map 30 Day Plan: objective -> expectedOutcome
  if (Array.isArray(data.thirtyDayPlan)) {
    data.thirtyDayPlan = data.thirtyDayPlan.map((week: any) => ({
      ...week,
      expectedOutcome: week.objective
    }));
  }

  // Map 90 Day Plan: objective -> focusAreas: [objective]
  if (Array.isArray(data.ninetyDayPlan)) {
    data.ninetyDayPlan = data.ninetyDayPlan.map((month: any) => ({
      ...month,
      focusAreas: month.objective ? [month.objective] : []
    }));
  }

  // Map Competitors: wrap strength in gapAnalysis
  if (Array.isArray(data.competitors)) {
    data.competitors = data.competitors.map((c: any) => ({
      ...c,
      gapAnalysis: {
        gapScore: c.strengthScore,
        missingAdvantages: c.strength ? [c.strength] : []
      }
    }));
  }

  adapted.auditData = data;
  return adapted;
}
