 import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DemoBooking from '@/models/DemoBooking';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log('Sending email to:', to);
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM!, name: 'GMBBoost' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    console.log('SendGrid status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('SendGrid error:', JSON.stringify(error));
    }

    return response;

  } catch (error) {
    console.error('Email send error:', error);
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, company, businessType, date, timeSlot, message } = body;

    console.log('Demo booking received:', { name, email, phone, company });

    // Validate required fields
    if (!name || !email || !phone || !company || !businessType || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save to MongoDB
    const booking = await DemoBooking.create({
      name, email, phone, company, businessType, date, timeSlot, message
    });

    console.log('Booking saved to MongoDB:', booking._id);

    // Email to admin
    console.log('Sending admin email to:', process.env.ADMIN_EMAIL);
    await sendEmail(
      process.env.ADMIN_EMAIL!,
      `New Demo Booking - ${name} from ${company}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Demo Booking!</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Name</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Email</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Phone</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Company</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${company}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Business Type</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${businessType}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Date</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Time</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${timeSlot}</td></tr>
            <tr><td style="padding: 8px;"><b>Message</b></td><td style="padding: 8px;">${message || 'None'}</td></tr>
          </table>
        </div>
      `
    );

    // Confirmation email to customer
    console.log('Sending customer email to:', email);
    await sendEmail(
      email,
      'Demo Booking Confirmed - GMBBoost',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Demo Confirmed!</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Your free demo has been successfully booked!</p>
          <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><b>Date:</b> ${date}</p>
            <p style="margin: 8px 0 0;"><b>Time:</b> ${timeSlot}</p>
          </div>
          <p>Our team will contact you shortly to confirm the meeting link.</p>
          <p style="color: #64748b; font-size: 14px;">Team GMBBoost</p>
        </div>
      `
    );

    console.log('All done - booking complete!');
    return NextResponse.json({ success: true, booking });

  } catch (error: any) {
    console.error('Demo booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const bookings = await DemoBooking.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}