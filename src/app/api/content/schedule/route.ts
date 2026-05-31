import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

const schedulePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  postType: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  cta: z.string().optional(),
  tone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schedulePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    await dbConnect();

    // Mock tenant/auth data (replace with actual auth context in production)
    const tenantId = 'demo-tenant';
    const organizationId = 'demo-org';
    const businessId = new mongoose.Types.ObjectId(); // Mock business ID for now

    const postData = parsed.data;

    const newPost = await Post.create({
      tenantId,
      organizationId,
      businessId,
      title: postData.title,
      content: postData.content,
      postType: postData.postType,
      hashtags: postData.hashtags || [],
      cta: postData.cta,
      tone: postData.tone,
      status: 'draft', // Saved as draft for the scheduling system to pick up
      aiGenerated: true,
      platform: 'gmb',
    });

    return NextResponse.json({ success: true, postId: newPost._id }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to schedule post:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
