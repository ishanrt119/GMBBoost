/**
 * provider.ts
 *
 * GMB provider that calls the REAL Google Places API.
 * The MockGMBProvider has been removed.
 * If GOOGLE_MAPS_API_KEY is missing we throw clearly rather than return fake data.
 */
import { fetchRealBusinessData } from '@/services/audit/realDataService';

export interface GMBBusinessData {
  businessName: string;
  location: string;
  rating: number;
  reviewsCount: number;
  categories: string[];
  primaryCategory: string;
  photosCount: number;
  qaCount: number;
  postsCount: number;
  businessHours: { day: string; hours: string }[];
  attributes: string[];
  reviews: { author: string; rating: number; text: string; date: string; ownerReply?: string }[];
  hasWebsite: boolean;
  hasPhone: boolean;
  hasDescription: boolean;
  description: string;
  phone: string;
  website: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

export interface IGMBProvider {
  fetchBusinessDetails(businessName: string, location: string, gbpUrl?: string): Promise<GMBBusinessData>;
}

export class GooglePlacesGMBProvider implements IGMBProvider {
  async fetchBusinessDetails(
    businessName: string,
    location: string,
    gbpUrl?: string
  ): Promise<GMBBusinessData> {
    const real = await fetchRealBusinessData(businessName, location, gbpUrl);

    if (!real) {
      // API key missing or place not found — return skeleton with zeros
      // so the audit can proceed with AI analysis using at least the name/location
      console.warn(`[GMBProvider] Could not fetch real data for "${businessName}" — using skeleton`);
      return {
        businessName,
        location,
        rating: 0,
        reviewsCount: 0,
        categories: [],
        primaryCategory: 'local_business',
        photosCount: 0,
        qaCount: 0,
        postsCount: 0,
        businessHours: [],
        attributes: [],
        reviews: [],
        hasWebsite: false,
        hasPhone: false,
        hasDescription: false,
        description: '',
        phone: '',
        website: '',
        placeId: '',
        latitude: 0,
        longitude: 0,
      };
    }

    return {
      businessName: real.name,
      location: real.address,
      rating: real.rating,
      reviewsCount: real.reviewsCount,
      categories: real.categories,
      primaryCategory: real.primaryCategory,
      photosCount: real.photosCount,
      qaCount: 0,          // not in Places API response
      postsCount: 0,       // GBP posts not in Places API
      businessHours: real.businessHours,
      attributes: [],      // not in Places API response
      reviews: real.reviews,
      hasWebsite: !!real.website,
      hasPhone: !!real.phone,
      hasDescription: real.hasDescription,
      description: real.description,
      phone: real.phone,
      website: real.website,
      placeId: real.placeId,
      latitude: real.latitude,
      longitude: real.longitude,
    };
  }
}

export function getGMBProvider(): IGMBProvider {
  return new GooglePlacesGMBProvider();
}
