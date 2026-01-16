// src/routes/review.routes.ts
import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';

const router = Router();

// Public routes
router.get('/', reviewController.getReviews);
router.get('/:id', reviewController.getReview);

// Protected routes
router.use(authenticate);
router.get('/user/my-reviews', reviewController.getUserReviews);
router.post('/:productId', validate(createReviewSchema), reviewController.createReview);
router.patch('/:id', validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;