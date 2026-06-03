import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Audit from '@/models/Audit';
import { processAuditJob } from '@/services/audit/auditService';

const auditRequestSchema = z.object({
  businessName: z.string().min(2, 'Business name is too short'),
  location: z.string().min(2, 'Location is too short'),
  gbpUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = auditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { businessName, location, gbpUrl } = parsed.data;

    await dbConnect();

    // Mock tenant data (in a real app, extract from auth token/session)
    const tenantId = 'demo-tenant';
    const userId = 'demo-user';
    const organizationId = 'demo-org';

    // Create a pending audit
    const audit = await Audit.create({
      tenantId,
      userId,
      organizationId,
      businessName,
      location,
      gbpUrl: gbpUrl || undefined,
      status: 'PENDING',
    });

    // Process the audit synchronously instead of using Inngest
    await processAuditJob(audit._id.toString());

    return NextResponse.json({ success: true, auditId: audit._id }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create audit request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "demo-tenant";
    
    // Return audits for a given tenant
    const audits = await Audit.find({ tenantId }).sort({ createdAt: -1 });

    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
