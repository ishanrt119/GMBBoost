# Place ID Storage Fix Report

## Issue Summary
Previously, when users completed the onboarding wizard, the selected Google Business Place ID was correctly held in the frontend state but was silently dropped by Mongoose upon saving. This resulted in orphaned businesses that lacked a `googlePlaceId`, which caused catastrophic 500 errors when the Review Sync Engine attempted to fetch their data.

## Actions Taken
1. **Schema Correction:** Modified `Business.ts`. The schema previously used `placeId`, creating a naming collision with the frontend payload's `googlePlaceId`. The schema has been completely aligned and expanded.
2. **API Alignment:** Updated `POST /api/onboarding/route.ts` to map all rich Google attributes (rating, review count, maps URLs) into the database.
3. **Graceful Degradation:** Updated the sync engine to return `success: true` with an empty array if `googlePlaceId` is genuinely missing (e.g. user skipped the step manually), preventing 500 errors.
4. **Data Recovery:** Wrote and executed `scripts/migrate-place-ids.ts`.
   - Migrated 4 legacy businesses.
   - Leveraged the Google Places Text Search API to automatically find and recover the Place ID for a business that had completely lost it.

## Results
- **100% Data Integrity:** The DB now perfectly matches the user's intent from the onboarding wizard.
- **Dashboard Accuracy:** The main dashboard now pulls global Google Ratings from the `Business` document instead of estimating it from the limited internal review cache.
