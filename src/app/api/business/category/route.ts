import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { businessId, category } = body;
    
    if (!businessId || !category) {
      return NextResponse.json({ success: false, error: 'Business ID and Category are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    let activeBusinessId = cookieStore.get('activeBusinessId')?.value;
    
    if (!activeBusinessId && process.env.NODE_ENV === 'development') {
      activeBusinessId = '65c0c1b7a2d4f5c9e2b0a1f1'; // DEV_CONTEXT.businessId
    }

    if (activeBusinessId !== businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify this business' }, { status: 403 });
    }

    const updated = await Business.findByIdAndUpdate(
      businessId,
      { 
        $set: { userDefinedCategory: category },
        $setOnInsert: { 
          name: 'Fallback Business', 
          category: 'General', 
          address: 'Unknown',
          organizationId: '65c0c1b7a2d4f5c9e2b0a1f2' // DEV_CONTEXT.organizationId
        }
      },
      { new: true, upsert: process.env.NODE_ENV === 'development' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error('Update Category API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}
