// src/routes/order.routes.ts
import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createOrderSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
} from '../validators/order.validator';

const router = Router();

router.use(authenticate);

// User routes
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.get('/admin/all', authorize('ADMIN'), orderController.getAllOrders);
router.patch(
    '/:id/status',
    authorize('ADMIN'),
    validate(updateOrderStatusSchema),
    orderController.updateOrderStatus
);
router.patch(
    '/:id/payment-status',
    authorize('ADMIN'),
    validate(updatePaymentStatusSchema),
    orderController.updatePaymentStatus
);

export default router;