import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/services/google/auth';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const tempTokensStr = cookieStore.get('tempGoogleOAuth')?.value;
    
    if (!tempTokensStr) {
      return NextResponse.json({ success: false, error: 'No OAuth tokens found. Please connect Google first.' }, { status: 401 });
    }

    const tempTokens = JSON.parse(tempTokensStr);
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: tempTokens.access_token,
      refresh_token: tempTokens.refresh_token
    });

    // We must use mybusinessbusinessinformation API (v1)
    // Note: googleapis package has `mybusinessbusinessinformation`
    const businessInfo = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client });
    
    // 1. Fetch Accounts
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client });
    const accountsRes = await mybusinessaccountmanagement.accounts.list();
    const accounts = accountsRes.data.accounts || [];

    if (accounts.length === 0) {
      return NextResponse.json({ success: false, error: 'No Google Business Profile accounts found.' });
    }

    // 2. Fetch Locations for all accounts
    let allLocations: any[] = [];
    for (const account of accounts) {
      const locationsRes = await businessInfo.accounts.locations.list({
        parent: account.name,
        readMask: 'name,title,storefrontAddress,metadata'
      });
      if (locationsRes.data.locations) {
        allLocations = [...allLocations, ...locationsRes.data.locations];
      }
    }

    return NextResponse.json({ success: true, locations: allLocations, accountId: accounts[0].name });

  } catch (error: any) {
    console.error('Fetch GBP Locations Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
