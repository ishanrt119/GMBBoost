import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import { getOAuth2Client } from '@/services/google/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/onboarding?error=google_auth_failed', req.url));
    }

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get the user's Google Account info
    const oauth2 = require('googleapis').google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Check if user is logged in
    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;

    if (businessId) {
      // User is already logged in (e.g., they connected from the dashboard settings)
      await dbConnect();
      await Business.findByIdAndUpdate(businessId, {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleAccountId: userInfo.data.id,
        googleTokenExpiry: tokens.expiry_date,
        googleConnected: true
      });
      return NextResponse.redirect(new URL('/dashboard/settings?google=connected', req.url));
    } else {
      // User is likely in the middle of onboarding. 
      // We can't save directly to Business yet because it's not created.
      // So we set a secure cookie with the tokens so StepCompletion can pick it up.
      
      const payload = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        account_id: userInfo.data.id
      };

      cookieStore.set('tempGoogleOAuth', JSON.stringify(payload), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 // 1 hour
      });

      // Redirect to a dedicated location selection page or close popup
      // For simplicity, we redirect back to a success page that closes itself or signals the parent window.
      return new NextResponse(
        `<html><body><script>
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error: any) {
    console.error('Google Callback Error:', error);
    return new NextResponse(
      `<html><body><script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
