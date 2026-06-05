import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Audit from '@/models/Audit';
import Business from '@/models/Business';
import { requireClient } from '@/lib/auth';
import { inngest } from '@/services/inngest/client';

const auditRequestSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
});

export async function POST(req: Request) {
  try {
    const authResult = await requireClient();
    if (!authResult.ok) return authResult.response;

    const body = await req.json();
    const parsed = auditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { businessId } = parsed.data;

    await dbConnect();

    // Verify business ownership and data completeness
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const isOwner = business.userId?.toString() === authResult.userId;
    const isOrgMember = authResult.user.organizationId && business.organizationId?.toString() === authResult.user.organizationId?.toString();
    const isSuperAdmin = authResult.user.role === 'SUPER_ADMIN';
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isOwner && !isOrgMember && !isSuperAdmin && !isDev) {
      console.warn(`[AUTH FAILED] User ${authResult.userId} tried to access Business ${businessId}. Business UserId: ${business.userId}, OrgId: ${business.organizationId}`);
      return NextResponse.json({ error: 'Unauthorized to access this business' }, { status: 403 });
    }

    if (!business.userDefinedCategory) {
      return NextResponse.json({ error: 'Business Category is missing. Please update your business profile.' }, { status: 400 });
    }

    if (!business.googlePlaceId) {
      return NextResponse.json({ error: 'Google Place ID is missing. Please connect your Google Business Profile.' }, { status: 400 });
    }

    // Create a pending audit
    const locationStr = [business.city, business.state].filter(Boolean).join(', ');
    const finalLocation = locationStr || business.address || 'Location hidden';

    const audit = await Audit.create({
      tenantId: authResult.user.organizationId?.toString() || authResult.userId,
      userId: authResult.userId,
      organizationId: authResult.user.organizationId?.toString() || 'default',
      businessName: business.name,
      location: finalLocation,
      gbpUrl: `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`,
      status: 'PENDING',
      metadata: {
        googlePlaceId: business.googlePlaceId,
        userDefinedCategory: business.userDefinedCategory,
        coordinates: business.location?.coordinates
      }
    });

    // Dispatch the job to Inngest for async processing
    try {
      await inngest.send({
        name: 'audit/generate.requested',
        data: { auditId: audit._id.toString() }
      });
    } catch (inngestError: any) {
      console.error('Inngest Dispatch Failed:', inngestError);
      return NextResponse.json({ error: 'Failed to connect to the background worker. Ensure you are running "npx inngest-cli@latest dev" in another terminal tab.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, auditId: audit._id }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create audit request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await requireClient();
    if (!authResult.ok) return authResult.response;

    await dbConnect();
    
    // Return audits for the active tenant
    const tenantId = authResult.user.organizationId?.toString() || authResult.userId;
    const audits = await Audit.find({ tenantId }).sort({ createdAt: -1 });

    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
