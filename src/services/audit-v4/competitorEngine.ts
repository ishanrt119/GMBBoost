import { GMBBusinessData } from '../gmb/provider';
import { GooglePlacesService } from '../google/places';
import { resolveCategory } from './categoryResolver';
import { isCompetitorValid } from './industryCategoryMap';
import { ICompetitorAnalysis } from '../../models/AuditHistory';

// Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export async function discoverCompetitors(data: GMBBusinessData, tier: number, userDefinedCategory: string): Promise<{ 
  competitors: ICompetitorAnalysis[], 
  logs: any[],
  gapAnalysis: any
}> {
  const radiusMap: Record<number, number> = { 1: 5000, 2: 10000, 3: 15000, 4: 25000, 5: 50000, 6: 50000 };
  const radiusMeters = radiusMap[tier] || 10000;
  const radiusKm = radiusMeters / 1000;
  
  const lat = data.latitude || 37.7749; 
  const lng = data.longitude || -122.4194;
  
  const targetResolvedCategory = userDefinedCategory;
  const targetReviews = Math.max(data.reviewsCount, 1);
  const targetRating = data.rating || 0;

  try {
    const results = await GooglePlacesService.nearbySearch(lat, lng, radiusMeters, targetResolvedCategory);
    const others = results.filter(r => r.name.toLowerCase() !== data.businessName.toLowerCase());

    const evaluated: ICompetitorAnalysis[] = [];
    const logs: any[] = [];

    for (const comp of others) {
      const compLat = comp.geometry?.location?.lat || 0;
      const compLng = comp.geometry?.location?.lng || 0;
      const distanceKm = Number(calculateDistanceKm(lat, lng, compLat, compLng).toFixed(2));
      
      const reviews = comp.user_ratings_total || 0;
      const rating = comp.rating || 0;
      const compTypes = comp.types || [];
      const compResolvedCategory = resolveCategory(compTypes);

      let score = 0;
      let rejected = false;
      let rejectionReason = "";

      // 1. Hard Category Validation (Prerequisite)
      const isCategoryValid = isCompetitorValid(targetResolvedCategory, compResolvedCategory, compTypes);
      if (!isCategoryValid) {
        rejected = true;
        rejectionReason = `Category mismatch (Expected related to '${targetResolvedCategory}', got '${compResolvedCategory}')`;
      } else {
        score += 40; // Max Category Score
      }

      // 2. Review Scale Similarity (25%)
      if (!rejected) {
        const reviewRatio = Math.min(reviews, targetReviews) / Math.max(reviews, targetReviews);
        // If they have extremely different scales, it's not a competitor (e.g. 5 vs 5000)
        if (reviewRatio < 0.1) {
          rejected = true;
          rejectionReason = `Review scale anomaly (Ratio ${reviewRatio.toFixed(2)} < 0.1)`;
        } else {
          score += (reviewRatio * 25);
        }
      }

      // 3. Rating Similarity (10%)
      if (!rejected) {
        const ratingDiff = Math.abs(rating - targetRating);
        if (ratingDiff > 2.0) {
          rejected = true;
          rejectionReason = `Rating anomaly (Diff ${ratingDiff.toFixed(1)} > 2.0)`;
        } else {
          score += ((2.0 - ratingDiff) / 2.0) * 10;
        }
      }

      // 4. Distance Score (15%)
      if (!rejected) {
        if (distanceKm > radiusKm) {
          rejected = true;
          rejectionReason = `Distance exceeds radius (${distanceKm}km > ${radiusKm}km)`;
        } else {
          score += ((radiusKm - distanceKm) / radiusKm) * 15;
        }
      }

      // 5. Authority Score (10% - Assuming 5% base + 5% for having place details)
      if (!rejected) {
        score += 5; 
      }

      score = Math.round(score);

      if (score < 70 && !rejected) {
        rejected = true;
        rejectionReason = `Similarity Score too low (${score} < 70)`;
      }

      if (rejected) {
        logs.push({
          name: comp.name,
          category: compResolvedCategory,
          distanceKm,
          score,
          status: 'REJECTED',
          reason: rejectionReason
        });
      } else {
        logs.push({
          name: comp.name,
          category: compResolvedCategory,
          distanceKm,
          score,
          status: 'ACCEPTED'
        });

        // Step 2: Details Fetch for Authentic Verified Data
        const details = await GooglePlacesService.getDetails(comp.place_id);
        const website = details?.website || null;
        if (website) score = Math.min(score + 5, 100); // Add authority points for website

        evaluated.push({
          placeId: comp.place_id,
          name: comp.name,
          distanceKm,
          rating: details?.rating || rating,
          reviewCount: reviews || null,
          photos: null, // Public API limits
          website: website,
          verified: null,
          category: compResolvedCategory,
          responseRate: null,
          posts: null,
          strengths: [],
          weaknesses: []
        });
      }
    }

    const sortedCompetitors = evaluated.sort((a, b) => b.reviewCount! - a.reviewCount!).slice(0, 10);
    
    // Calculate Gap Analysis
    const avgRating = sortedCompetitors.length ? (sortedCompetitors.reduce((acc, c) => acc + (c.rating || 0), 0) / sortedCompetitors.length) : 0;
    const avgReviews = sortedCompetitors.length ? (sortedCompetitors.reduce((acc, c) => acc + (c.reviewCount || 0), 0) / sortedCompetitors.length) : 0;
    
    const gaps = [];
    if (targetReviews < avgReviews) gaps.push(`You need ${Math.ceil(avgReviews - targetReviews)} more reviews to match the top local competitors.`);
    if (targetRating < avgRating) gaps.push(`Your rating (${targetRating}) is below the competitor average (${avgRating.toFixed(1)}).`);

    const gapAnalysis = {
      targetMetrics: { rating: targetRating, reviews: targetReviews, photos: data.photosCount || 0 },
      competitorAverages: { rating: Number(avgRating.toFixed(1)), reviews: Math.round(avgReviews), photos: 0 },
      gaps: gaps.length > 0 ? gaps : ['You are currently outperforming the top local competitors.']
    };

    return { competitors: sortedCompetitors, logs, gapAnalysis };
  } catch (error) {
    console.error('Error fetching authentic competitors:', error);
    return { 
      competitors: [], 
      logs: [],
      gapAnalysis: { targetMetrics: { rating: 0, reviews: 0, photos: 0 }, competitorAverages: { rating: 0, reviews: 0, photos: 0 }, gaps: [] } 
    };
  }
}
