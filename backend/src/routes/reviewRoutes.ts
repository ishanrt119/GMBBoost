import { Router } from 'express';
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  markReviewReviewed
} from '../controllers/reviewController';

const router = Router();

router.get('/reviews', getAllReviews);
router.get('/reviews/:id', getReviewById);
router.post('/reviews', createReview);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
router.post('/reviews/:id/approve', approveReview);
router.post('/reviews/:id/reviewed', markReviewReviewed);

export default router;