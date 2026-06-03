import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { DEV_CONTEXT } from '@/lib/dev-context';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';
import { inngest } from '@/services/inngest/client';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const businessId = DEV_CONTEXT.businessId;

    const leads = await Lead.find({ businessId: new mongoose.Types.ObjectId(businessId) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await dbConnect();

    const businessId = DEV_CONTEXT.businessId;

    // Default to demo tenant for now
    const tenantId = data.tenantId || 'demo-tenant';

    const lead = await Lead.create({
      tenantId,
      businessId: new mongoose.Types.ObjectId(businessId),
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source || 'Manual',
      pipelineStage: 'New',
      notes: data.notes,
    });

    // Log creation activity
    await Activity.create({
      tenantId,
      leadId: lead._id,
      type: 'status_change',
      content: 'Lead created in pipeline.',
    });

    // Trigger AI Scoring and FollowUp automation
    await inngest.send([
      { name: 'crm/lead-created', data: { leadId: lead._id.toString() } },
    ]);

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
