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
  similarityScore?: number;
  strengthScore?: number;
  gapAnalysis?: {
    missingAdvantages: string[];
    gapScore: number;
  };
}

export interface BusinessData {
  businessName: string;
  category: string;
  city: string;
  area: string;
  state: string;
  country: string;
  reviewCount: number;
  website?: string;
}

export function isEnterpriseBrand(name: string, reviewCount: number): boolean {
  if (reviewCount > 10000) return true;
  const enterpriseNames = [
    'tcs', 'tata consultancy services', 'infosys', 'wipro', 'hcl', 'google', 'microsoft', 'amazon',
    'cognizant', 'accenture', 'capgemini', 'ibm', 'oracle', 'cisco', 'apple', 'facebook', 'meta', 'desun hospital',
    'tech mahindra'
  ];
  const lowerName = name.toLowerCase();
  return enterpriseNames.some(ent => lowerName.includes(ent) && lowerName.length <= ent.length + 10);
}

export function classifyBusinessTier(reviewCount: number, hasWebsite: boolean, isEnterprise: boolean): string {
  if (isEnterprise) return 'Enterprise';
  if (reviewCount >= 1000) return 'Large Business';
  if (reviewCount >= 250) return 'Mid Market';
  if (reviewCount >= 50 || hasWebsite) return 'Small Business';
  return 'Micro Business';
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
      score -= 50; // Significant mismatch
    }
  }

  // Exact Tier Match Required
  if (targetTier !== competitorTier) {
    score -= 60; // Huge penalty for mismatched tier
  }

  // Exact Name Match Penalty (don't compare with self)
  if (targetBusiness.businessName.toLowerCase() === competitor.name.toLowerCase()) {
    score = 0;
  }

  return Math.max(0, score);
}

export function calculateGapAnalysis(target: BusinessData, comp: Competitor) {
  const missingAdvantages = [];
  let gapScore = 100;

  if (comp.reviewCount > target.reviewCount) {
    const diff = comp.reviewCount - target.reviewCount;
    missingAdvantages.push(`+${diff} Reviews`);
    gapScore -= Math.min(30, diff * 0.5);
  }

  if (comp.rating > 0) {
    // Only target doesn't have a good rating
    gapScore -= 10;
  }

  if (comp.website && !target.website) {
    missingAdvantages.push('Active Website Presence');
    gapScore -= 20;
  }

  if (comp.category && comp.category.toLowerCase() !== target.category.toLowerCase()) {
    missingAdvantages.push(`Specialized Category: ${comp.category}`);
  }

  return {
    missingAdvantages: missingAdvantages.slice(0, 3), // Top 3 advantages
    gapScore: Math.max(0, gapScore)
  };
}

export async function findCompetitors(businessData: BusinessData): Promise<{
  accepted: any[],
  rejected: any[],
  targetTier: string,
  evidenceSource: string
}> {
  const targetIsEnterprise = isEnterpriseBrand(businessData.businessName, businessData.reviewCount);
  const targetTier = classifyBusinessTier(businessData.reviewCount, !!businessData.website, targetIsEnterprise);

  const accepted: any[] = [];
  const rejected: any[] = [];

  const queries = [];
  
  // Strict Area Hierarchy
  if (businessData.area) {
    queries.push(`${businessData.category} in ${businessData.area}, ${businessData.city}`);
  }
  queries.push(`${businessData.category} in ${businessData.city}`);
  // Add broad zone if city fails
  queries.push(`Best ${businessData.category} in ${businessData.city}`);

  let foundEnough = false;

  for (const query of queries) {
    if (foundEnough) break;

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          engine: "google_maps",
          q: query,
          api_key: SERPAPI_KEY,
          num: 20 // Fetch up to 20 to have better filtering pool
        },
      });

      const localResults = response.data.local_results || [];

      for (const result of localResults) {
        if (accepted.length >= 10) {
          foundEnough = true;
          break;
        }

        const compReviewCount = result.reviews || 0;
        const compIsEnterprise = isEnterpriseBrand(result.title, compReviewCount);
        const compTier = classifyBusinessTier(compReviewCount, !!result.website, compIsEnterprise);

        const competitor: Competitor = {
          name: result.title,
          rating: result.rating || 0,
          reviewCount: compReviewCount,
          category: result.type || result.category || 'Unknown',
          address: result.address,
          website: result.website,
          strengthScore: Math.round((result.rating || 0) * 20) // Simple 0-100 scale
        };

        const similarityScore = calculateQualityScore(businessData, targetTier, competitor, compTier);
        competitor.similarityScore = similarityScore;

        if (similarityScore >= 50) { // Strict tier matching drops score heavily if wrong
          if (!accepted.find(c => c.name === competitor.name)) {
            // Calculate Gap Analysis natively
            competitor.gapAnalysis = calculateGapAnalysis(businessData, competitor);
            accepted.push({ ...competitor, tier: compTier });
          }
        } else {
          if (!rejected.find(r => r.competitor.name === competitor.name)) {
            rejected.push({
              competitor,
              reason: `Mismatched Business Tier: ${compTier} vs ${targetTier}`
            });
          }
        }
      }
      
      if (accepted.length >= 5) {
        foundEnough = true;
      }
      
    } catch (error) {
      console.error(`Error fetching competitors for query "${query}":`, error);
    }
  }

  // Sort by highest similarity
  accepted.sort((a, b) => b.similarityScore - a.similarityScore);

  return { 
    accepted: accepted.slice(0, 10), 
    rejected, 
    targetTier,
    evidenceSource: `Live SERP API Maps Search for queries: ${queries.join(' | ')}`
  };
}
