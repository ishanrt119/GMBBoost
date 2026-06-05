# Review Filtering Architecture

## Overview
Filtering and sorting of reviews is handled entirely server-side to guarantee accurate and high-performance querying against potentially massive review datasets.

## Implementation Details
1. **Frontend API Call:**
   The dashboard component (`ReviewsDashboard.tsx`) triggers a `fetch()` whenever the `activeFilter` or `activeSort` state changes, appending them to the query string (e.g., `?filter=critical&sort=lowest`).

2. **Backend Mapping (`/api/reviews/route.ts`):**
   - **Filters:** We map simple string filters into robust MongoDB query objects.
     - `unanswered` -> `{ replyStatus: { $ne: 'POSTED' } }`
     - `critical` -> `{ sentiment: 'critical' }`
     - `5-star` -> `{ rating: 5 }`
   - **Sorting:** We map sort strings into Mongoose sort objects.
     - `newest` -> `{ createdAt: -1 }`
     - `highest` -> `{ rating: -1, createdAt: -1 }`
     - `lowest` -> `{ rating: 1, createdAt: -1 }`

## Benefits
By pushing the filtering to MongoDB, we avoid the heavy memory overhead of loading all a business's reviews into Node.js/Browser memory just to find the subset the user wants to see.
