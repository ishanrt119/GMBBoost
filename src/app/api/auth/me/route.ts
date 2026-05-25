import { NextResponse } from 'next/server';
import { verifyToken } from '@/services/auth/security';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('-passwordHash -emailOtp -phoneOtp -passwordResetOtp');
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
}
