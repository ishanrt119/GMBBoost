import { Request, Response } from 'express';
import {
  fetchAllReviews,
  fetchReviewById,
  createNewReview,
  updateExistingReview,
  deleteExistingReview,
  approveExistingReview,
  markReviewAsReviewed
} from '../services/reviewService';

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const reviews = await fetchAllReviews(userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const review = await fetchReviewById(Number(req.params.id));
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await createNewReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await updateExistingReview(Number(req.params.id), req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await deleteExistingReview(Number(req.params.id));
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await approveExistingReview(Number(req.params.id));
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve review' });
  }
};

export const markReviewReviewed = async (req: Request, res: Response) => {
  try {
    const review = await markReviewAsReviewed(Number(req.params.id));
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark review as reviewed' });
  }
};