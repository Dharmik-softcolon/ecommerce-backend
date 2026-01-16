// src/routes/coupon.routes.ts
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { applyCouponSchema } from '../validators/coupon.validator';

const couponRouter = Router();

couponRouter.post(
    '/validate',
    authenticate,
    validate(applyCouponSchema),
    adminController.validateCoupon
);

export { couponRouter };