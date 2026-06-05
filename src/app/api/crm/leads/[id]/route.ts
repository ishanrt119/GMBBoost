import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const oldStage = lead.pipelineStage;
    
    if (Object.prototype.hasOwnProperty.call(data, 'pipelineStage')) lead.pipelineStage = data.pipelineStage;
    if (Object.prototype.hasOwnProperty.call(data, 'notes')) lead.notes = data.notes;
    if (Object.prototype.hasOwnProperty.call(data, 'status')) lead.status = data.status;
    if (Object.prototype.hasOwnProperty.call(data, 'tags')) lead.tags = data.tags;

    lead.lastActivityAt = new Date();
    await lead.save();

    if (Object.prototype.hasOwnProperty.call(data, 'pipelineStage') && data.pipelineStage !== oldStage) {
      await Activity.create({
        tenantId: lead.tenantId,
        leadId: lead._id,
        type: 'status_change',
        content: `Moved from ${oldStage || 'Unassigned'} to ${data.pipelineStage || 'Unassigned'}`
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}