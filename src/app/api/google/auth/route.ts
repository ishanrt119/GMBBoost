import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/services/google/auth';

export async function GET(req: Request) {
  try {
    const url = generateAuthUrl();
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
