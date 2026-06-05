import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
<<<<<<< HEAD
import { requireClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireClient();
    if (!auth.ok) return auth.response;

    const data = await req.json();
    await dbConnect();

    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;

    if (!businessId) {
      return NextResponse.json({ error: 'No active business selected' }, { status: 400 });
    }

    const lead = await Lead.findOne({ _id: id, businessId });
    if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

    const oldStage = lead.pipelineStage;
    
    if (Object.prototype.hasOwnProperty.call(data, 'pipelineStage')) lead.pipelineStage = data.pipelineStage;
    if (Object.prototype.hasOwnProperty.call(data, 'notes')) lead.notes = data.notes;
    if (Object.prototype.hasOwnProperty.call(data, 'status')) lead.status = data.status;
    if (Object.prototype.hasOwnProperty.call(data, 'tags')) lead.tags = data.tags;
=======

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const oldStage = lead.pipelineStage;
    
    // Update fields
    if (data.pipelineStage) lead.pipelineStage = data.pipelineStage;
    if (data.notes) lead.notes = data.notes;
    if (data.status) lead.status = data.status;
    if (data.tags) lead.tags = data.tags;
>>>>>>> integration-samarth

    lead.lastActivityAt = new Date();
    await lead.save();

<<<<<<< HEAD
    if (Object.prototype.hasOwnProperty.call(data, 'pipelineStage') && data.pipelineStage !== oldStage) {
=======
    // Log status change if stage changed
    if (data.pipelineStage && data.pipelineStage !== oldStage) {
>>>>>>> integration-samarth
      await Activity.create({
        tenantId: lead.tenantId,
        leadId: lead._id,
        type: 'status_change',
<<<<<<< HEAD
        content: `Moved from ${oldStage || 'Unassigned'} to ${data.pipelineStage || 'Unassigned'}`
=======
        content: `Moved from ${oldStage} to ${data.pipelineStage}`
>>>>>>> integration-samarth
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> integration-samarth
