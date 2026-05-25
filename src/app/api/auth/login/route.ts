import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/services/auth/security';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      return NextResponse.json({ success: false, error: 'Account temporarily locked due to failed attempts' }, { status: 403 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash!);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await user.save();
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isEmailVerified) {
      return NextResponse.json({ success: false, error: 'Please verify your email before logging in', unverified: true }, { status: 403 });
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({ userId: user._id, role: user.role, email: user.email });
    
    const response = NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
