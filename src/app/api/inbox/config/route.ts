import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BusinessAIConfig from '@/models/BusinessAIConfig';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const businessId = url.searchParams.get('businessId');
    if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

    let config = await BusinessAIConfig.findOne({ businessId: new mongoose.Types.ObjectId(businessId) });
    if (!config) {
      config = await BusinessAIConfig.create({
        tenantId: 'demo-tenant',
        businessId: new mongoose.Types.ObjectId(businessId),
        systemPrompt: "You are an AI WhatsApp sales agent. Your goal is to qualify leads and help book demos. Keep responses under 60 words. Ask one question at a time. After 2 exchanges, attempt demo booking.",
        aiTone: "Professional and helpful",
        salesRules: "Never offer discounts. Always collect email before booking.",
        aiEnabled: true
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const { businessId, systemPrompt, aiTone, salesRules, aiEnabled } = data;

    const config = await BusinessAIConfig.findOneAndUpdate(
      { businessId: new mongoose.Types.ObjectId(businessId) },
      { systemPrompt, aiTone, salesRules, aiEnabled },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
