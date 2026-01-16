// src/routes/product.routes.ts
import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
} from '../validators/product.validator';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

// Public routes
router.get('/', validate(productQuerySchema), productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/bestsellers', productController.getBestsellers);
router.get('/search', productController.searchProducts);
router.get('/by-id/:id', productController.getProductById);
router.get('/:slug', productController.getProduct);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:productId/reviews', productController.getProductReviews);

// Protected routes
router.post(
    '/:productId/reviews',
    authenticate,
    validate(createReviewSchema),
    productController.createReview
);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate(createProductSchema),
    productController.createProduct
);
router.patch(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validate(updateProductSchema),
    productController.updateProduct
);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.deleteProduct);

export default router;