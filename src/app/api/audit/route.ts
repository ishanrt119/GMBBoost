import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import AuditHistory from '@/models/AuditHistory';
import Business from '@/models/Business';
import { runEnterpriseAudit } from '@/services/audit-v4/auditEngine';

const auditRequestSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = auditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { businessId } = parsed.data;

    await dbConnect();

    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const tenantId = business.tenantId || 'demo-tenant';

    // Process the enterprise audit synchronously
    const audit = await runEnterpriseAudit(businessId, tenantId);

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
    const audits = await AuditHistory.find({ tenantId }).sort({ createdAt: -1 });

    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}
