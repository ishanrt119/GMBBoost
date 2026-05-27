import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, generateToken } from '@/services/auth/security';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // 1. Get the current token
    const tokenCookie = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('auth_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify token to get userId
    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // 3. Update the User document
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    user.onboardingCompleted = true;
    await user.save();

    // 4. Generate new token with onboardingCompleted = true
    const newToken = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email,
      onboardingCompleted: true,
      activeModules: payload.activeModules || []
    });

    const response = NextResponse.json({ success: true, message: 'Onboarding completed' });

    // 5. Set the new cookie
    response.cookies.set({
      name: 'auth_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
