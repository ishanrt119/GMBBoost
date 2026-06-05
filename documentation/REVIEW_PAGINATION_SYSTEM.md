# Review Pagination System

## Overview
The platform fetches reviews from the backend using robust server-side pagination to ensure the dashboard remains performant even when a business has thousands of reviews.

## Architecture
1. **Frontend State (`ReviewsDashboard.tsx`):**
   - Tracks `currentPage` and `limit` (items per page: 10, 50, 100).
   - Passes these as URL query parameters to the API (`?page=1&limit=10`).
2. **Backend API (`/api/reviews/route.ts`):**
   - Parses `page` and `limit`.
   - Computes MongoDB `skip` value: `skip = (page - 1) * limit`.
   - Executes two concurrent database queries using `Promise.all()`:
     - `Review.find().skip(skip).limit(limit)` to fetch the exact chunk of data.
     - `Review.countDocuments()` to fetch the total available records.
   - Returns the data alongside pagination metadata (`total`, `totalPages`).
3. **UI Component (`ReviewPagination.tsx`):**
   - A dedicated component rendering the "Previous/Next" buttons and up to 5 surrounding page number links dynamically based on the current active page.
