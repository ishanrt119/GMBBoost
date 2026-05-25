import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, validatePasswordStrength } from '@/services/auth/security';
import { generateOTP, hashOTP } from '@/services/auth/otp';
import { sendEmailOtp } from '@/services/email';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { fullName, email, phone, password, companyName } = await req.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.error }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email or phone already registered.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const emailOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashedPassword,
      companyName,
      emailOtpHash: hashOTP(emailOtp),
      emailOtpExpiry: otpExpiry,
    });

    try {
      await sendEmailOtp(user.email, emailOtp, 'verify');
    } catch (sendError) {
      console.error('Failed to send email OTP directly:', sendError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful. Please verify OTPs.',
      userId: user._id
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
