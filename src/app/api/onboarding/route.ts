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
      address: body.address || 'Unknown',
      phone: body.phone,
      website: body.website,
      placeId: body.googlePlaceId || undefined, // undefined prevents unique sparse index crash
      googleConnected: !!body.googlePlaceId,
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
    const cookieStore = await cookies();
    cookieStore.set('activeBusinessId', newBusiness._id.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return NextResponse.json({ success: true, businessId: newBusiness._id }, { status: 200 });

  } catch (error: any) {
    console.error('Onboarding Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save configuration' }, { status: 500 });
  }
}
