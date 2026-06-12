import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed or fallback to direct match
    let isValid = false;
    if (user.passwordHash?.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      isValid = user.passwordHash === password;
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const cookieStore = await cookies();
    
    // Set userId cookie
    cookieStore.set('userId', user._id.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // Determine activeBusinessId
    let activeBusinessId = user.activeBusinessId?.toString();
    
    if (!activeBusinessId) {
      // Find the first business they own if active is not set
      const business = await Business.findOne({ userId: user._id });
      if (business) {
        activeBusinessId = business._id.toString();
        // Update user
        await User.updateOne(
          { _id: user._id },
          { $set: { activeBusinessId: business._id } }
        );
      }
    }

    if (activeBusinessId) {
      cookieStore.set('activeBusinessId', activeBusinessId, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', details: error.message, stack: error.stack }, { status: 500 });
  }
}
