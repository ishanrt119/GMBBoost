import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const BASE_URL = "https://serpapi.com/search.json";

export enum CompetitorReason {
  SAME_CATEGORY = "Searched competitor in same category",
  SAME_SERVICE_AREA = "Competing in same service area",
  REVIEW_VOLUME_MATCH = "Similar review volume tier",
  LOCAL_RANKING_COMPETITOR = "Ranks for overlapping keywords",
  CATEGORY_SPECIALIST = "Category specialist in region"
}

export interface Competitor {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  address?: string;
  website?: string;
  categoryMatchScore?: number;
  distance?: number;
  similarityScore?: number;
  strengthScore?: number;
  reason?: string;
  strength?: string;
  gapAnalysis?: {
    missingAdvantages: string[];
    gapScore: number;
    gapScoreBreakdown?: {
      reviews: number;
      rating: number;
      category: number;
      profile: number;
      total: number;
    }
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

const BANNED_CATEGORIES = [
  'university', 'college', 'school', 'coaching', 'mobile repair',
  'telecom retail', 'restaurant', 'hospital', 'hotel', 'real estate', 'government'
];

export function calculateCategorySimilarityScore(targetCategory: string, compCategory: string): number {
  const tCat = targetCategory.toLowerCase();
  const cCat = compCategory.toLowerCase();

  // Hard exclusion
  for (const banned of BANNED_CATEGORIES) {
    if (cCat.includes(banned)) return 0;
  }

  if (tCat === cCat) return 100;
  if (tCat.includes(cCat) || cCat.includes(tCat)) return 80;
  
  // Basic semantic check fallback (realistically requires NLP, using baseline text match)
  const tWords = tCat.split(/[^a-z0-9]/).filter(Boolean);
  const cWords = cCat.split(/[^a-z0-9]/).filter(Boolean);
  const intersection = tWords.filter(w => cWords.includes(w));
  
  if (intersection.length > 0) return 60; // Partial match

  return 20; // Unrelated
}

export function calculateQualityScore(
  targetBusiness: BusinessData,
  targetTier: string,
  competitor: Competitor,
  competitorTier: string
): number {
  let score = 100;

  // Exact Name Match Penalty (don't compare with self)
  if (targetBusiness.businessName.toLowerCase() === competitor.name.toLowerCase()) {
    return 0;
  }

  // Exact Tier Match Required
  if (targetTier !== competitorTier) {
    score -= 60; // Huge penalty for mismatched tier
  }

  return Math.max(0, score);
}

export function calculateGapAnalysis(target: BusinessData, comp: Competitor) {
  const missingAdvantages = [];
  
  // Deterministic Gap Score Breakdown
  // 40% Review Volume Advantage
  // 25% Rating Advantage
  // 20% Category Specialization Advantage
  // 15% Profile Completeness Advantage
  
  let gapReviews = 0;
  let gapRating = 0;
  let gapCategory = 0;
  let gapProfile = 0;

  // 1. Review Volume
  if (comp.reviewCount > target.reviewCount) {
    const diff = comp.reviewCount - target.reviewCount;
    missingAdvantages.push(`+${diff} Reviews`);
    // Max 40 penalty
    gapReviews = Math.min(40, diff * 0.5);
  }

  // 2. Rating
  if (comp.rating > 0) {
    gapRating = 25; // Simple penalty if competitor has established rating
  }

  // 3. Category Specialization
  if (comp.category && comp.category.toLowerCase() !== target.category.toLowerCase()) {
    missingAdvantages.push(`Specialized Category: ${comp.category}`);
    gapCategory = 20;
  }

  // 4. Profile
  if (comp.website && !target.website) {
    missingAdvantages.push('Active Website Presence');
    gapProfile = 15;
  }

  const totalPenalty = gapReviews + gapRating + gapCategory + gapProfile;
  const gapScore = Math.max(0, 100 - totalPenalty);

  return {
    missingAdvantages: missingAdvantages.slice(0, 3), // Top 3 advantages
    gapScore: Math.round(gapScore),
    gapScoreBreakdown: {
      reviews: Math.round(gapReviews),
      rating: gapRating,
      category: gapCategory,
      profile: gapProfile,
      total: Math.round(totalPenalty)
    }
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
        const compRating = result.rating || 0;
        
        let qualityScore = 0;
        if (compRating > 0) qualityScore += 1;
        if (compReviewCount > 0) qualityScore += 1;
        if (result.website) qualityScore += 1;
        if (result.address) qualityScore += 1;

        if (qualityScore < 2) {
          rejected.push({
            competitor: { name: result.title, category: result.type || 'Unknown' },
            reason: `Low quality score (${qualityScore}/4): Missing sufficient business signals.`
          });
          continue;
        }

        const compIsEnterprise = isEnterpriseBrand(result.title, compReviewCount);
        const compTier = classifyBusinessTier(compReviewCount, !!result.website, compIsEnterprise);

        const ratingComponent = (compRating / 5) * 50;
        const reviewComponent = Math.min(30, Math.log10(compReviewCount + 1) * 10);
        // Proxy for profile completeness: has website and address
        let profileCompletenessProxy = 0.5; 
        if (result.website && result.address) profileCompletenessProxy = 1;
        const profileComponent = profileCompletenessProxy * 20;

        let compReasonStr = CompetitorReason.LOCAL_RANKING_COMPETITOR;
        let compStrengthStr = "Local ranking presence";

        if (compTier === targetTier) {
          compReasonStr = CompetitorReason.REVIEW_VOLUME_MATCH;
          compStrengthStr = "Matched authority tier";
        }
        
        if (result.address && businessData.area && result.address.toLowerCase().includes(businessData.area.toLowerCase())) {
          compReasonStr = CompetitorReason.SAME_SERVICE_AREA;
          compStrengthStr = "Hyper-local relevance";
        } else if (result.type && result.type.toLowerCase() === businessData.category.toLowerCase()) {
          compReasonStr = CompetitorReason.SAME_CATEGORY;
          compStrengthStr = "Direct category competitor";
        }

        if (compReviewCount > businessData.reviewCount + 50) {
          compStrengthStr = "Dominant review authority";
        } else if ((result.rating || 0) >= 4.8) {
          compStrengthStr = "Exceptional rating quality";
        }

        const competitor: Competitor = {
          name: result.title,
          rating: result.rating || 0,
          reviewCount: compReviewCount,
          category: result.type || result.category || 'Unknown',
          address: result.address,
          website: result.website,
          strengthScore: Math.round(ratingComponent + reviewComponent + profileComponent),
          reason: compReasonStr,
          strength: compStrengthStr
        };

        const catScore = calculateCategorySimilarityScore(businessData.category, competitor.category);
        competitor.categoryMatchScore = catScore;

        if (catScore < 60) {
          if (!rejected.find(r => r.competitor.name === competitor.name)) {
            rejected.push({
              competitor,
              reason: `Unrelated Category: ${competitor.category} (Score: ${catScore}%)`
            });
          }
          continue;
        }

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
