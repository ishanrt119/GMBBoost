import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import User from '@/models/User';
import Organization from '@/models/Organization';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const cookieStore = await cookies();
    const tempTokensStr = cookieStore.get('tempGoogleOAuth')?.value;
    let oauthTokens = null;
    if (tempTokensStr) {
      try {
        oauthTokens = JSON.parse(tempTokensStr);
      } catch (e) {}
    }
    
    // 1. Find or Create User (Handles duplicate test emails)
    let newUser = await User.findOne({ email: body.email });
    if (!newUser) {
      newUser = await User.create({
        fullName: body.fullName || 'Test User',
        email: body.email,
        phone: body.phone || `000${Date.now().toString().slice(-7)}`, // random phone to prevent dupes
        passwordHash: body.password, // Dev mode bypass
        role: 'BusinessOwner',
        isEmailVerified: true,
        onboardingCompleted: true
      });
    }

    // 2. Create Organization
    const newOrg = await Organization.create({
      name: body.businessName || 'My Organization',
      ownerId: newUser._id,
      subscriptionPlan: body.selectedPlan === 'starter' ? 'Free' : 'Pro'
    });

    // 3. Create Business
    const newBusiness = await Business.create({
      name: body.businessName,
      category: body.category || 'Local Business',
      userDefinedCategory: body.userDefinedCategory || 'General',
      address: body.address || 'Unknown',
      phone: body.phone,
      website: body.website,
      googlePlaceId: body.googlePlaceId || undefined, // undefined prevents unique sparse index crash
      googleMapsUrl: body.googleMapsUrl,
      googleBusinessProfileUrl: body.gbpUrl,
      reviewLink: body.gbpUrl,
      formattedAddress: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      googleRating: body.rating,
      googleReviewCount: body.totalReviews,
      googleConnected: !!oauthTokens || !!body.googlePlaceId,
      googleLocationId: body.googleLocationId,
      googleAccessToken: oauthTokens?.access_token,
      googleRefreshToken: oauthTokens?.refresh_token,
      googleAccountId: oauthTokens?.account_id,
      googleTokenExpiry: oauthTokens?.expiry_date,
      organizationId: newOrg._id,
      userId: newUser._id,
      metaBusinessProfileUrl: body.metaBusinessProfileUrl,
      facebookPageUrl: body.facebookPageUrl,
      instagramUrl: body.instagramUrl,
      whatsappConfig: {
        provider: 'meta',
        businessPhone: body.whatsappBusinessNumber,
        metaProfileUrl: body.metaBusinessProfileUrl,
        isConnected: !!body.whatsappBusinessNumber
      },
      aiSettings: {
        tone: body.aiTone || 'professional',
        salesPrompt: body.aiSalesPrompt
      },
      onboardingCompleted: true
    });

    // 4. Update User Context
    await User.findByIdAndUpdate(newUser._id, {
      $set: {
        organizationId: newOrg._id,
        activeBusinessId: newBusiness._id
      }
    });

    // 5. Set Cookie for Dashboard state (Bypassing NextAuth)
    cookieStore.set('activeBusinessId', newBusiness._id.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // Clear temp OAuth cookie
    cookieStore.delete('tempGoogleOAuth');

    return NextResponse.json({ success: true, businessId: newBusiness._id }, { status: 200 });

  } catch (error: any) {
    console.error('Onboarding Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save configuration' }, { status: 500 });
  }
}
