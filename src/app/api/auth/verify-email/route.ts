import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyOTP } from '@/services/auth/otp';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    if (user.failedOtpAttempts >= 5) {
      return NextResponse.json({ success: false, error: 'Too many failed attempts. Please request a new code.' }, { status: 429 });
    }

    const now = new Date();
    if (!user.emailOtpHash || !user.emailOtpExpiry || now > user.emailOtpExpiry) {
      return NextResponse.json({ success: false, error: 'OTP expired or invalid. Please resend.' }, { status: 400 });
    }

    if (!verifyOTP(otp, user.emailOtpHash)) {
      user.failedOtpAttempts += 1;
      await user.save();
      return NextResponse.json({ success: false, error: 'Incorrect OTP' }, { status: 400 });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailOtpHash = undefined;
    user.emailOtpExpiry = undefined;
    user.failedOtpAttempts = 0; // Reset
    
    await user.save();

    return NextResponse.json({ success: true, message: 'Email verified successfully.' });

  } catch (error: any) {
    console.error('Email Verification Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
