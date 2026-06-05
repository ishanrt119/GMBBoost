# Google Token Management

## Overview
Google OAuth Access Tokens expire quickly (usually within 1 hour). To ensure background jobs (like the Review Sync Engine) can continuously fetch reviews on behalf of the user, robust token refresh handling is required.

## Refresh Strategy
1. **Offline Access:** During the initial OAuth flow, the app explicitly requests `access_type: 'offline'` and `prompt: 'consent'`. This guarantees Google returns a long-lived `refresh_token`.
2. **Persistence:** The `Business` schema stores the `googleAccessToken`, `googleRefreshToken`, and `googleTokenExpiry`.
3. **Auto-Refresh Hook:** In `gbp.ts`, we utilize the `googleapis` SDK's built-in token management:
   - We inject the stored credentials into the `OAuth2Client`.
   - We attach an event listener to the client: `oauth2Client.on('tokens', callback)`.
   - Whenever the `OAuth2Client` detects that the access token has expired during an API request, it automatically uses the refresh token to get a new one.
   - Our event listener catches this event, grabs the fresh tokens, and saves them back to the `Business` document in MongoDB.

This ensures seamless, uninterrupted background syncing without requiring the user to ever log in again.
