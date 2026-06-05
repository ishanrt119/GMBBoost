# Review Sync Workers

## Overview
The platform utilizes Inngest for distributed, fault-tolerant background synchronization.

### 1. `reviewSyncWorker` (The Dispatcher)
- **Trigger:** Cron Schedule `0 */6 * * *` (Every 6 hours)
- **Purpose:** Fetches all active businesses from MongoDB and creates a massive fan-out of individual jobs.

### 2. `processReviewSyncJob` (The Worker)
- **Trigger:** Event `reviews/sync`
- **Retries:** Configured to retry up to 3 times with exponential backoff.
- **Purpose:** Executes the actual Google API network request. By isolating this per-business, a rate limit or failure on one business will not crash the sync process for others.

### 3. `criticalAlertWorker` (The Watcher)
- **Trigger:** Event `reviews/critical-alert`
- **Purpose:** If the Sentiment Engine flags a newly synced review as `critical` (e.g. 1-star complaining about service), the sync engine emits this event. This worker catches it and fires an immediate SMS/WhatsApp alert to the business owner to handle the PR crisis.
