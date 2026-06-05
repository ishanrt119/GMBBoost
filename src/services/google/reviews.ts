import { ProviderReview } from '../reviews/providers/MockGoogleProvider';

export class GoogleReviewsService {
  private static getApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Fetches the 5 most recent reviews from the Google Places API for a given placeId, along with overall ratings.
   */
  static async fetchGoogleReviews(placeId: string): Promise<{ reviews: ProviderReview[], rating?: number, totalReviews?: number }> {
    if (!placeId) {
      throw new Error("Missing Google Place ID.");
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY is not set.");
      throw new Error("Google Maps API Key is not configured.");
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("fields", "reviews,rating,user_ratings_total");
    url.searchParams.append("reviews_sort", "newest");
    // Optionally specify language or reviews_no_translations

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      // If ZERO_RESULTS or no reviews, just return empty array instead of throwing
      if (data.status === "ZERO_RESULTS" || (data.status === "OK" && !data.result?.reviews)) {
        return [];
      }
      throw new Error(`Google Places API Error: ${data.status}`);
    }

    const reviews = data.result.reviews || [];

    const mappedReviews = reviews.map((r: any) => ({
      // Using author_url or time + author_name as a unique ID since Places API doesn't always give a distinct review ID
      providerReviewId: `gmb-pub-${placeId}-${r.time}-${Buffer.from(r.author_name || 'unknown').toString('base64').substring(0, 10)}`,
      reviewerName: r.author_name || 'Anonymous',
      rating: r.rating || 0,
      text: r.text || '',
      postedAt: new Date(r.time * 1000).toISOString(),
    }));

    return {
      reviews: mappedReviews,
      rating: data.result.rating,
      totalReviews: data.result.user_ratings_total
    };
  }
}
