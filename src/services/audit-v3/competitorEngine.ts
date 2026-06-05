import { GMBBusinessData } from '../gmb/provider';
import { GooglePlacesService } from '../google/places';
import { resolveCategory } from './categoryResolver';
import { isCompetitorValid } from './industryCategoryMap';
import { ICompetitorAnalysis } from '../../models/AuditHistory';

// Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export async function discoverCompetitors(data: GMBBusinessData, tier: number): Promise<{ competitors: ICompetitorAnalysis[], logs: any[] }> {
  const radiusMap: Record<number, number> = { 1: 5000, 2: 10000, 3: 15000, 4: 25000, 5: 50000, 6: 50000 };
  const radiusMeters = radiusMap[tier] || 10000;
  const radiusKm = radiusMeters / 1000;
  
  const lat = data.latitude || 37.7749; 
  const lng = data.longitude || -122.4194;
  
  const targetResolvedCategory = resolveCategory(data.categories);
  const keyword = targetResolvedCategory;
  const targetReviews = Math.max(data.reviewsCount, 1);
  const targetRating = data.rating || 0;

  try {
    const results = await GooglePlacesService.nearbySearch(lat, lng, radiusMeters, keyword);
    
    // Filter out target itself
    const others = results.filter(r => r.name.toLowerCase() !== data.businessName.toLowerCase());

    const evaluated: ICompetitorAnalysis[] = [];
    const logs: any[] = [];

    // Evaluate candidates
    for (const comp of others) {
      const compLat = comp.geometry?.location?.lat || 0;
      const compLng = comp.geometry?.location?.lng || 0;
      const distanceKm = Number(calculateDistanceKm(lat, lng, compLat, compLng).toFixed(2));
      
      const reviews = comp.user_ratings_total || 0;
      const compTypes = comp.types || [];
      const compResolvedCategory = resolveCategory(compTypes);

      let rejected = false;
      let rejectionReason = "";

      // 1. Distance Validation (Haversine)
      if (distanceKm > radiusKm) {
        rejected = true;
        rejectionReason = `Distance exceeds radius (${distanceKm}km > ${radiusKm}km)`;
      }

      // 2. Hard Category Validation
      if (!rejected) {
        const isValid = isCompetitorValid(targetResolvedCategory, compResolvedCategory, compTypes);
        if (!isValid) {
          rejected = true;
          rejectionReason = `Category mismatch (Expected related to '${targetResolvedCategory}', got '${compResolvedCategory}')`;
        }
      }

      // 3. Review Count Anomaly Check (> 5x difference)
      if (!rejected) {
        if (reviews > targetReviews * 5 || reviews < targetReviews / 5) {
          rejected = true;
          rejectionReason = `Review count anomaly (Target: ${targetReviews}, Comp: ${reviews})`;
        }
      }

      if (rejected) {
        logs.push({
          name: comp.name,
          category: compResolvedCategory,
          distanceKm,
          status: 'REJECTED',
          reason: rejectionReason
        });
      } else {
        logs.push({
          name: comp.name,
          category: compResolvedCategory,
          distanceKm,
          status: 'ACCEPTED'
        });

        // Step 2: Fetch detailed place info for accepted candidates to get website & photos
        const details = await GooglePlacesService.getDetails(comp.place_id);
        
        let website = null;
        let rating = comp.rating || null;
        let photos = null; 
        
        if (details) {
          website = details.website || null;
          rating = details.rating || rating;
        }

        evaluated.push({
          placeId: comp.place_id,
          name: comp.name,
          distanceKm,
          rating,
          reviewCount: reviews || null,
          photos: photos,
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

    // Return the top 10 competitors closest to the target
    const sorted = evaluated.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 10);
    return { competitors: sorted, logs };
  } catch (error) {
    console.error('Error fetching authentic competitors:', error);
    return { competitors: [], logs: [] };
  }
}
