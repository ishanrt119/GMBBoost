# Google Review Integration

## Current Implementation Strategy

Due to the complex OAuth verification requirements of the full Google My Business (GMB) API, this integration leverages the **Google Places Details API**.

### Advantages
- Requires only a standard Google Maps API Key.
- No complex user-facing OAuth flow required during onboarding.
- Simply requires the `googlePlaceId` which is already captured via the Maps Autocomplete widget in step 1 of onboarding.

### Limitations
- The public Places API is capped at returning the **5 most recent reviews**.
- It does not expose a native endpoint for *publishing* replies (AI replies can still be generated and tracked internally, but must be copy/pasted manually into Google or handled via a deep link).

## Deduplication Strategy
Because the Places API does not return a distinct, globally unique `review_id`, we synthesize a `providerReviewId` by hashing the reviewer's name and the unix timestamp of the review. This guarantees idempotency when upserting into MongoDB.
