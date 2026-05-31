import { NextResponse } from 'next/server';
import { inngest } from '@/services/inngest/client';

export async function POST(req: Request) {
  process.env.INNGEST_DEV = "1";
  process.env.INNGEST_EVENT_KEY = process.env.INNGEST_EVENT_KEY || "local";

  try {
    const { businessId } = await req.json();

    if (!businessId) {
       // Just for the demo, grab the first business if not provided
       const dbConnect = (await import('@/lib/mongodb')).default;
       const Business = (await import('@/models/Business')).default;
       await dbConnect();
       const demoBusiness = await Business.findOne();
       if (!demoBusiness) return NextResponse.json({ error: 'No business found to generate for' }, { status: 400 });
       
       await inngest.send({
         name: 'scheduler/manual-generate',
         data: { businessId: demoBusiness._id.toString(), force: true }
       });
    } else {
       await inngest.send({
         name: 'scheduler/manual-generate',
         data: { businessId, force: true }
       });
    }

    return NextResponse.json({ success: true, message: 'Generation job dispatched successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to dispatch manual generation:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
