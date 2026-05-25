import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, hashOTP } from '@/services/auth/otp';
import { sendEmailOtp } from '@/services/email';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: false, error: 'Email already verified' }, { status: 400 });
    }

    const emailOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.emailOtpHash = hashOTP(emailOtp);
    user.emailOtpExpiry = otpExpiry;
    await user.save();

    const verifyResult = await sendEmailOtp(user.email, emailOtp, 'verify');

    if (!verifyResult.success) {
      return NextResponse.json({ success: false, error: verifyResult.error || 'Failed to send Email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });

  } catch (error: any) {
    console.error('Email Resend Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
