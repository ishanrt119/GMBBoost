import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import Business from "@/models/Business";
import { generatePost } from "@/services/ai";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    // Default to user ID 1 or a specific ID if auth is not fully set up in Next.js yet
    // In production, this should use NextAuth session
    const filter: any = {};
    if (status) filter.status = status;

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newPost = await Post.create({
      ...body,
      status: body.status || "PENDING_APPROVAL",
    });

    return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
