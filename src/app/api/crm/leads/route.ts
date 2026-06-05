import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
<<<<<<< HEAD
import { requireClient } from '@/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const auth = await requireClient();
    if (!auth.ok) return auth.response;

    await dbConnect();
    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;

    if (!businessId) {
      return NextResponse.json({ error: 'No active business selected' }, { status: 400 });
    }
=======
import { DEV_CONTEXT } from '@/lib/dev-context';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';
import { inngest } from '@/services/inngest/client';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const businessId = DEV_CONTEXT.businessId;
>>>>>>> integration-samarth

    const leads = await Lead.find({ businessId: new mongoose.Types.ObjectId(businessId) })
      .sort({ createdAt: -1 })
      .lean();
<<<<<<< HEAD
=======

>>>>>>> integration-samarth
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
<<<<<<< HEAD
    const auth = await requireClient();
    if (!auth.ok) return auth.response;

    const data = await req.json();
    await dbConnect();

    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;

    if (!businessId) {
      return NextResponse.json({ error: 'No active business selected' }, { status: 400 });
    }

=======
    const data = await req.json();
    await dbConnect();

    const businessId = DEV_CONTEXT.businessId;

    // Default to demo tenant for now
>>>>>>> integration-samarth
    const tenantId = data.tenantId || 'demo-tenant';

    const lead = await Lead.create({
      tenantId,
      businessId: new mongoose.Types.ObjectId(businessId),
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source || 'Manual',
<<<<<<< HEAD
      pipelineStage: null,
      notes: data.notes,
    });

    // Activity creation removed for dev stability
    // inngest removed for dev - add back in production
=======
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
>>>>>>> integration-samarth

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> integration-samarth
