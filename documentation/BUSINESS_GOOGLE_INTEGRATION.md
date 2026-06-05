# Business Google Integration Architecture

## Goal
Establish a 1:1 mapping between a GMBBoost `Business` entity and a real-world Google Maps `Place`.

## Schema Enhancements
To achieve this, the `Business` schema has been significantly expanded to hold a mirror of the most critical Google Place details:
```typescript
  googlePlaceId: { type: String, unique: true, sparse: true },
  googleMapsUrl: { type: String },
  googleBusinessProfileUrl: { type: String },
  reviewLink: { type: String },
  formattedAddress: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  googleRating: { type: Number, default: 0 },
  googleReviewCount: { type: Number, default: 0 },
  googleConnected: { type: Boolean, default: false },
```

## Benefits
1. **Zero Fake Metrics:** The main dashboard no longer needs to calculate aggregate ratings from an incomplete cache of reviews. It reads `business.googleRating` which is the true, global score from Google (e.g. 4.8 out of 1,200 reviews).
2. **Review Campaign Generation:** By persisting `reviewLink` during onboarding, the Review Campaigns module can instantly inject the exact URL into WhatsApp messages without needing to execute a Google search dynamically.
3. **Seamless Fallbacks:** If a business opts out of Google Integration during onboarding, `googlePlaceId` remains undefined. The sync engine is now coded to gracefully bypass the API fetch rather than crashing the dashboard with a 500 Server Error.
