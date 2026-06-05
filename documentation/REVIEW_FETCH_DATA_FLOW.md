# Review Fetch Data Flow (Updated)

With the `googlePlaceId` persistence bug resolved, the Review Fetch data flow is now fully operational end-to-end.

## The Cycle

1. **Trigger**
   - **Manual:** User clicks "Sync" -> hits `POST /api/reviews/fetch`.
   - **Automated:** Inngest cron job fires every 6 hours.

2. **Context Resolution**
   - The engine receives a `businessId` (either from the Inngest queue payload or decoded from the secure browser cookie).
   - The `Business` collection is queried.

3. **Google API Fetch**
   - The engine validates `business.googlePlaceId`.
   - It queries `https://maps.googleapis.com/maps/api/place/details/json` for `fields=reviews,rating,user_ratings_total`.

4. **Bi-Directional Save**
   - **Reviews Collection:** The 5 most recent reviews are scraped, run through the Sentiment Engine, and upserted based on their unique timestamps.
   - **Business Collection:** The newly fetched global `rating` and `user_ratings_total` are saved back to the `Business` document to ensure the dashboard always shows the freshest overall score.
