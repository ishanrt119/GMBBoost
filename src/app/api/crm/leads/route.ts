import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
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
    const auth = await requireClient();
    if (!auth.ok) return auth.response;

    const data = await req.json();
    await dbConnect();

    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;

    if (!businessId) {
      return NextResponse.json({ error: 'No active business selected' }, { status: 400 });
    }

    const tenantId = data.tenantId || 'demo-tenant';

    const lead = await Lead.create({
      tenantId,
      businessId: new mongoose.Types.ObjectId(businessId),
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source || 'Manual',
      pipelineStage: null,
      notes: data.notes,
    });

    // Activity creation removed for dev stability
    // inngest removed for dev - add back in production

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}