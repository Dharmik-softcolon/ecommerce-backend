// backend/src/routes/category.routes.ts
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createCategorySchema,
    updateCategorySchema,
} from '../validators/category.validator';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @query   parent - Filter by parent category (use 'null' for root categories)
 * @query   includeInactive - Include inactive categories (admin use)
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/tree
 * @desc    Get categories in tree structure
 * @access  Public
 */
router.get('/tree', categoryController.getCategoryTree);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get single category by slug
 * @access  Public
 */
router.get('/:slug', categoryController.getCategory);

/**
 * @route   GET /api/categories/by-id/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/by-id/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/categories/:slug/products
 * @desc    Get all products in a category
 * @access  Public
 */
router.get('/:slug/products', categoryController.getCategoryProducts);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Admin
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate(createCategorySchema),
    categoryController.createCategory
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update a category
 * @access  Admin
 */
router.patch(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validate(updateCategorySchema),
    categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Admin
 */
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    categoryController.deleteCategory
);

/**
 * @route   PATCH /api/categories/:id/toggle-status
 * @desc    Toggle category active status
 * @access  Admin
 */
router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize('ADMIN'),
    categoryController.toggleCategoryStatus
);

/**
 * @route   POST /api/categories/reorder
 * @desc    Reorder categories (for sorting)
 * @access  Admin
 */
router.post(
    '/reorder',
    authenticate,
    authorize('ADMIN'),
    categoryController.reorderCategories
);

export default router;