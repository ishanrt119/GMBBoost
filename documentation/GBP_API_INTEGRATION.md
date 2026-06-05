# GBP API Integration

## Overview
The system uses the official Google Business Profile (GBP) APIs instead of the limited Public Places API. This unlocks full historical review fetching, pagination, and direct reply posting.

## Modules Used
We utilize the `googleapis` Node SDK. The endpoints heavily leverage the `v4` APIs for GBP:
- **Reviews Fetching:** `GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`
- **Review Replying:** `PUT https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply`

## Abstraction Layer
`src/services/google/gbp.ts` acts as the single source of truth for interacting with Google APIs.
It exposes:
1. `getBusinessOAuthClient(business)`: Initializes a `google.auth.OAuth2` client using the encrypted tokens stored in the `Business` model.
2. `fetchAllReviews(business)`: Automatically paginates through the Google Reviews endpoint using `nextPageToken` until all historical reviews are retrieved.
3. `replyToReview(business, reviewId, replyText)`: Pushes a reply directly to Google.

## ID Mapping
- **Google Location ID:** Stored in `Business.googleLocationId`.
- **Google Review ID:** Stored in `Review.googleReviewId` (unique identifier to prevent duplicate ingestion during sync).
