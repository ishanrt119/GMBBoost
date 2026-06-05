# Review Fetch Flow

## Sequence of Events

### 1. Manual Sync (Dashboard)
1. User clicks "Sync Reviews" in the Reviews Dashboard.
2. The React frontend sends a `POST` request to `/api/reviews/fetch`.
3. The Next.js API route securely reads the `activeBusinessId` from the HTTP-Only cookie.
4. The API route invokes `syncBusinessReviews(businessId)`.
5. The Sync Engine updates the database and returns the freshly synced payload back to the client.
6. The UI updates instantly.

### 2. Automated Sync (Background)
1. At hour 0, 6, 12, 18, the `reviewSyncWorker` cron job triggers via Inngest.
2. It fetches all `Business` IDs from MongoDB.
3. It dispatches a `reviews/sync` event for each business.
4. The `processReviewSyncJob` worker picks up the event.
5. The worker directly calls `syncBusinessReviews(businessId)` completely bypassing the HTTP API layer.
6. The database is silently updated in the background.
