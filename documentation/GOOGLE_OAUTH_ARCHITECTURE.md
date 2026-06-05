# Google OAuth Architecture

## Overview
GMBBoost integrates Google OAuth to securely request permissions from business owners, allowing the platform to manage their Google Business Profile (GBP) reviews on their behalf.

## Flow
1. **Initiation:** The user clicks "Connect Google Account" during onboarding (StepGoogle).
2. **Redirect:** The frontend opens a popup to `/api/google/auth`.
3. **Google Consent Screen:** The user grants `business.manage` and `profile` scopes.
4. **Callback (`/api/google/callback`):**
   - Receives the `code`.
   - Exchanges it for `access_token`, `refresh_token`, and `expiry_date`.
   - Saves these temporarily in an HTTP-only secure cookie `tempGoogleOAuth` (because the Business document is not yet created in the DB during onboarding step 3).
5. **Location Fetching (`/api/google/locations`):**
   - The frontend polls this endpoint, which uses the temporary tokens to fetch all GBP accounts and their associated locations.
   - The user selects the exact business location they want to manage.
6. **Final Persistence (`/api/onboarding`):**
   - When the user finishes onboarding, the final API route reads the `tempGoogleOAuth` cookie, creates the `Business` document in MongoDB, saves the tokens permanently, and clears the temp cookie.

## Security Considerations
- **Popup Pattern:** The OAuth flow runs in a popup window that communicates success via `window.opener.postMessage()`. This keeps the user firmly inside the onboarding wizard context without losing state.
- **Temporary Cookies:** Tokens are temporarily cached in secure cookies during onboarding to prevent exposing them to the frontend.
