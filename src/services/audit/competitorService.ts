import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const BASE_URL = "https://serpapi.com/search.json";

export interface Competitor {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  address?: string;
  website?: string;
  distance?: number;
}

export interface BusinessData {
  businessName: string;
  category: string;
  city: string;
  area: string;
  state: string;
  country: string;
  reviewCount: number;
}

export function calculateTier(reviewCount: number, isEnterprise: boolean): string {
  if (isEnterprise) return 'Tier 6';
  if (reviewCount > 10000) return 'Tier 5';
  if (reviewCount > 2000) return 'Tier 4';
  if (reviewCount > 500) return 'Tier 3';
  if (reviewCount > 100) return 'Tier 2';
  return 'Tier 1';
}

export function isEnterpriseBrand(name: string, reviewCount: number): boolean {
  if (reviewCount > 10000) return true;
  const enterpriseNames = [
    'tcs', 'tata consultancy services', 'infosys', 'wipro', 'hcl', 'google', 'microsoft', 'amazon',
    'cognizant', 'accenture', 'capgemini', 'ibm', 'oracle', 'cisco', 'apple', 'facebook', 'meta', 'desun hospital'
  ];
  const lowerName = name.toLowerCase();
  return enterpriseNames.some(ent => lowerName.includes(ent) && lowerName.length <= ent.length + 10);
}

export function calculateQualityScore(
  targetBusiness: BusinessData,
  targetTier: string,
  competitor: Competitor,
  competitorTier: string
): number {
  let score = 100;

  // Category Match
  const tCat = targetBusiness.category.toLowerCase();
  const cCat = competitor.category.toLowerCase();
  if (tCat !== cCat) {
    if (tCat.includes(cCat) || cCat.includes(tCat)) {
      score -= 10;
    } else {
      score -= 30; // Significant mismatch
    }
  }

  // Tier Match
  const tTierNum = parseInt(targetTier.replace('Tier ', '')) || 1;
  const cTierNum = parseInt(competitorTier.replace('Tier ', '')) || 1;
  const tierDiff = Math.abs(tTierNum - cTierNum);
  if (tierDiff === 1) score -= 15;
  if (tierDiff > 1) score -= 35; // Too far apart

  // Review Count Difference (more granular)
  if (targetBusiness.reviewCount > 0) {
    const ratio = Math.max(targetBusiness.reviewCount, competitor.reviewCount) / Math.max(1, Math.min(targetBusiness.reviewCount, competitor.reviewCount));
    if (ratio > 5) score -= 20;
    else if (ratio > 3) score -= 10;
  }

  // Exact Name Match Penalty (don't compare with self)
  if (targetBusiness.businessName.toLowerCase() === competitor.name.toLowerCase()) {
    score = 0;
  }

  return Math.max(0, score);
}

export async function findCompetitors(businessData: BusinessData): Promise<{
  accepted: any[],
  rejected: any[],
  targetTier: string
}> {
  const targetIsEnterprise = isEnterpriseBrand(businessData.businessName, businessData.reviewCount);
  const targetTier = calculateTier(businessData.reviewCount, targetIsEnterprise);

  const accepted: any[] = [];
  const rejected: any[] = [];

  const queries = [];
  if (businessData.area) {
    queries.push(`${businessData.category} in ${businessData.area}, ${businessData.city}`);
  }
  queries.push(`${businessData.category} in ${businessData.city}`);

  let foundEnough = false;

  for (const query of queries) {
    if (foundEnough) break;

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          engine: "google_maps",
          q: query,
          api_key: SERPAPI_KEY,
        },
      });

      const localResults = response.data.local_results || [];

      for (const result of localResults) {
        if (accepted.length >= 6) {
          foundEnough = true;
          break;
        }

        const compReviewCount = result.reviews || 0;
        const compIsEnterprise = isEnterpriseBrand(result.title, compReviewCount);
        const compTier = calculateTier(compReviewCount, compIsEnterprise);

        const competitor: Competitor = {
          name: result.title,
          rating: result.rating || 0,
          reviewCount: compReviewCount,
          category: result.type || result.category || 'Unknown',
          address: result.address,
          website: result.website
        };

        // Enterprise rejection unless target is enterprise
        if (compIsEnterprise && !targetIsEnterprise) {
          rejected.push({
            competitor,
            reason: `Enterprise Brand Detected (${compTier})`
          });
          continue;
        }

        const qualityScore = calculateQualityScore(businessData, targetTier, competitor, compTier);

        if (qualityScore >= 70) {
          // Avoid duplicates
          if (!accepted.find(c => c.name === competitor.name)) {
            accepted.push({ ...competitor, qualityScore, tier: compTier });
          }
        } else {
          if (!rejected.find(r => r.competitor.name === competitor.name)) {
            rejected.push({
              competitor,
              reason: `Quality Score Too Low (${qualityScore})`
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching competitors for query "${query}":`, error);
    }
  }

  return { accepted, rejected, targetTier };
}
