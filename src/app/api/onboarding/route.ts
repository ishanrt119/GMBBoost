import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import User from '@/models/User';
import { DEV_CONTEXT } from '@/lib/dev-context';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const businessId = DEV_CONTEXT.businessId;
    const userId = DEV_CONTEXT.userId;

    // 1. Update Business with onboarding data
    await Business.findByIdAndUpdate(businessId, {
      $set: {
        services: body.description,
        keywords: body.keywords ? body.keywords.split(',').map((k: string) => k.trim()) : [],
        placeId: body.googlePlaceId,
        gbpUrl: body.gbpUrl,
        integrations: {
          twilioSid: body.twilioSid,
          twilioAuthToken: body.twilioAuthToken,
          whatsappNumber: body.whatsappNumber
        },
        aiSettings: {
          tone: body.aiTone,
          salesPrompt: body.aiSalesPrompt
        },
        onboardingCompleted: true
      }
    });

    // 2. Mark User as onboarded
    await User.findByIdAndUpdate(userId, {
      $set: { onboardingCompleted: true }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
