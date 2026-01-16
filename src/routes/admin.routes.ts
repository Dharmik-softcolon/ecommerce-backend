// src/routes/admin.routes.ts
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCouponSchema, updateCouponSchema, applyCouponSchema } from '../validators/coupon.validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Orders (admin access)
router.get('/orders', orderController.getAllOrders);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.get('/coupons/:id', adminController.getCoupon);
router.post('/coupons', validate(createCouponSchema), adminController.createCoupon);
router.patch('/coupons/:id', validate(updateCouponSchema), adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Newsletter
router.get('/newsletter', adminController.getNewsletterSubscribers);

// Contact messages
router.get('/messages', adminController.getContactMessages);
router.patch('/messages/:id/read', adminController.markMessageAsRead);
router.delete('/messages/:id', adminController.deleteContactMessage);

export default router;

// Public coupon validation route (separate)
