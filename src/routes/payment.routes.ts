// src/routes/payment.routes.ts
import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Webhook needs raw body
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook
);

// Protected routes
router.use(authenticate);
router.post('/create-checkout', paymentController.createCheckoutSession);
router.post('/confirm', paymentController.confirmPayment);
router.get('/status/:orderId', paymentController.getPaymentStatus);

export default router;