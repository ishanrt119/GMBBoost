import { PrismaClient } from '@prisma/client';
import { generateAIReply } from './aiService';

const prisma = new PrismaClient();

export const fetchAllReviews = async (userId?: number) => {
  if (userId) {
    return await prisma.review.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }
  return await prisma.review.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const fetchReviewById = async (id: number) => {
  return await prisma.review.findUnique({
    where: { id }
  });
};

export const createNewReview = async (data: {
  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply?: string;
  status?: string;
  userId?: number;
}) => {
  if (data.userId) {
    const existing = await prisma.review.findFirst({
      where: {
        reviewText: data.reviewText,
        userId: data.userId
      }
    });
    if (existing) return existing;
  }

  let aiReply = data.aiReply;
  if (!aiReply) {
    aiReply = await generateAIReply(data.reviewText, data.rating, data.reviewerName);
  }

  return await prisma.review.create({
    data: {
      reviewerName: data.reviewerName,
      rating: data.rating,
      reviewText: data.reviewText,
      aiReply: aiReply,
      status: data.status || 'pending',
      userId: data.userId || null
    }
  });
};

export const updateExistingReview = async (id: number, data: {
  reviewerName?: string;
  rating?: number;
  reviewText?: string;
  aiReply?: string;
  status?: string;
}) => {
  return await prisma.review.update({
    where: { id },
    data
  });
};

export const deleteExistingReview = async (id: number) => {
  return await prisma.review.delete({
    where: { id }
  });
};

export const approveExistingReview = async (id: number) => {
  return await prisma.review.update({
    where: { id },
    data: { status: 'approved' }
  });
};

export const markReviewAsReviewed = async (id: number) => {
  return await prisma.review.update({
    where: { id },
    data: { status: 'reviewed' }
  });
};