import { GooglePlacesService } from '../google/places';
import Business from '../../models/Business';
import { IGMBProvider, GMBBusinessData } from './provider';

export class GoogleBusinessProfileProvider implements IGMBProvider {
  async fetchBusinessDetails(businessName: string, location: string, gbpUrl?: string, businessId?: string): Promise<GMBBusinessData> {
    let placeId = null;

    // 1. Try to get placeId from Business model
    if (businessId) {
      const b = await Business.findById(businessId);
      if (b && b.googlePlaceId) {
        placeId = b.googlePlaceId;
      }
    }

    // 2. Fallback to Google Places Autocomplete to find placeId
    if (!placeId) {
      const query = `${businessName} ${location}`;
      const results = await GooglePlacesService.autocomplete(query);
      if (results && results.length > 0) {
        placeId = results[0].placeId;
      }
    }

    // 3. Fetch authentic details from Google
    if (placeId) {
      const details = await GooglePlacesService.getDetails(placeId);
      if (details) {
        // Format categories properly (replace underscore, title case)
        const categories = details.categories.map(c => 
          c.replace(/_/g, ' ')
           .split(' ')
           .map(w => w.charAt(0).toUpperCase() + w.slice(1))
           .join(' ')
        );

        return {
          businessName: details.name || businessName,
          location: details.formattedAddress || location,
          city: details.city,
          state: details.state,
          country: details.country,
          postalCode: details.postalCode,
          latitude: details.latitude,
          longitude: details.longitude,
          rating: details.rating || 0,
          reviewsCount: details.totalReviews || 0,
          categories: categories.length > 0 ? categories : ['Business'],
          photosCount: 0, // Not available without GBP API
          qaCount: 0, // Not available without GBP API
          postsCount: 0, // Not available without GBP API
          businessHours: [], // Can fetch from Details API but skipping for now
          attributes: [],
          reviews: [] // We could fetch reviews here using the Reviews service
        };
      }
    }

    // 4. Ultimate fallback if absolutely no data found
    return {
      businessName,
      location,
      rating: 0,
      reviewsCount: 0,
      categories: ['Local Business'],
      photosCount: 0,
      qaCount: 0,
      postsCount: 0,
      businessHours: [],
      attributes: [],
      reviews: []
    };
  }
}
