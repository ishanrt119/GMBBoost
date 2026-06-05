import { GMBBusinessData } from '../gmb/provider';
import { resolveCategory } from './categoryResolver';

export function analyzeSEO(data: GMBBusinessData) {
  const primaryCategory = resolveCategory(data.categories);
  
  // The system should determine Top Local Keywords based on category and location
  const topLocalKeywords = [
    `${primaryCategory} in ${data.city || 'my area'}`,
    `best ${primaryCategory} near me`,
    `${primaryCategory} ${data.city || ''}`.trim(),
  ];

  // We cannot calculate coverage density accurately without the GBP description text and services list.
  // Since we don't have OAuth to fetch description yet, we return null to enforce the "No Fake Data" rule.
  
  return {
    topLocalKeywords,
    keywordCoveragePercent: null,
    keywordDensity: null,
    missingKeywords: [],
    highOpportunityKeywords: []
  };
}
