# Google Review Sync Architecture

## Core Components

1. **GoogleReviewsService (`src/services/google/reviews.ts`)**
   - The low-level integration layer with the Google Places API.
   - Fetches raw review data using `https://maps.googleapis.com/maps/api/place/details/json`.
   - Transforms Google's arbitrary schema into our standardized `ProviderReview` interface.

2. **SyncEngine (`src/services/reviews/syncEngine.ts`)**
   - The orchestrator.
   - Accepts a `businessId`, fetches the associated `Business` document to retrieve the `googlePlaceId`.
   - Calls `GoogleReviewsService` to get new reviews.
   - Passes new reviews through the Groq-powered `analyzeSentiment` engine to determine `positive`, `neutral`, `negative`, or `critical` tags.
   - Upserts into MongoDB using `providerReviewId` to prevent duplication.
   - Recalculates and updates the `ReviewAnalytics` collection for the dashboard.

3. **Inngest Worker (`src/services/inngest/functions.ts`)**
   - A distributed cron job running every 6 hours.
   - Iterates over all active businesses and dispatches individual, retryable `reviews/sync` events.
   - Offloads the API request burden into a robust queue system, preventing timeouts.
