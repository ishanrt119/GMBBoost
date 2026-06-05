import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { syncBusinessReviews } from '@/services/reviews/syncEngine';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const businessId = cookieStore.get('activeBusinessId')?.value;
    
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. No active business.' }, { status: 401 });
    }

    const result = await syncBusinessReviews(businessId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to sync reviews:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
