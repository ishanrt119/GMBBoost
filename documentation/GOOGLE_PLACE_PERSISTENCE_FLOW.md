# Google Place Persistence Flow

## The Onboarding Pipeline

1. **StepBusiness.tsx (Frontend Integration)**
   - The user searches for their business using the `autocomplete` API.
   - Upon selection, the frontend triggers `place-details` to fetch rich Google Maps data.
   - The returned payload (including `placeId`, `latitude`, `longitude`, `rating`, `user_ratings_total`, and Maps URLs) is stored directly into the React `OnboardingData` context state.

2. **StepCompletion.tsx (Payload Submission)**
   - The user finalizes onboarding and clicks "Launch".
   - The `OnboardingData` is serialized and sent via `POST` to `/api/onboarding`.

3. **route.ts (MongoDB Insertion)**
   - The backend maps the flat `body` object into the deeply nested `Business` Mongoose Schema.
   - Crucially, it maps `body.googlePlaceId` directly to the `googlePlaceId` schema property, preventing dropped variables.
   - It also stores `googleRating`, `googleReviewCount`, `reviewLink`, and geographic coordinates.
   - A secure Next.js HTTP-Only cookie `activeBusinessId` is minted and returned to the browser.

4. **Sync Engine Activation**
   - Background jobs (Inngest) and dashboard components now reference the newly minted, fully populated `Business` document, relying heavily on the persisted `googlePlaceId`.
