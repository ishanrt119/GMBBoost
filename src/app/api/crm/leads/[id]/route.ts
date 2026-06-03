import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';

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

    lead.lastActivityAt = new Date();
    await lead.save();

    // Log status change if stage changed
    if (data.pipelineStage && data.pipelineStage !== oldStage) {
      await Activity.create({
        tenantId: lead.tenantId,
        leadId: lead._id,
        type: 'status_change',
        content: `Moved from ${oldStage} to ${data.pipelineStage}`
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
