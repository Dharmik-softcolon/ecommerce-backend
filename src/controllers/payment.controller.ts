// src/controllers/payment.controller.ts
import { Response, NextFunction } from 'express';
import { Order, Cart, Product } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import {
    createPaymentIntent,
    confirmPaymentIntent,
    constructWebhookEvent,
} from '../services/payment.service';
import { Request } from 'express';

export const createCheckoutSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.paymentStatus === 'PAID') {
            throw new AppError('Order is already paid', 400);
        }

        const paymentIntent = await createPaymentIntent(order.total, 'inr', {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: userId,
        });

        // Update order with payment intent ID
        order.paymentIntentId = paymentIntent.id;
        await order.save();

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const confirmPayment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { paymentIntentId, orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        const paymentIntent = await confirmPaymentIntent(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            order.paymentStatus = 'PAID';
            order.status = 'CONFIRMED';
            order.paymentIntentId = paymentIntentId;
            await order.save();

            res.json({
                success: true,
                data: {
                    status: 'succeeded',
                    order,
                },
            });
        } else {
            res.json({
                success: true,
                data: {
                    status: paymentIntent.status,
                },
            });
        }
    } catch (error) {
        next(error);
    }
};

export const handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const signature = req.headers['stripe-signature'] as string;
        const event = constructWebhookEvent(req.body, signature);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as any;
                const orderId = paymentIntent.metadata?.orderId;

                if (orderId) {
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'PAID',
                        status: 'CONFIRMED',
                        paymentIntentId: paymentIntent.id,
                    });
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as any;
                const orderId = paymentIntent.metadata?.orderId;

                if (orderId) {
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'FAILED',
                    });
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        next(error);
    }
};

export const getPaymentStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orderId } = req.params;
        const userId = req.user!.id;

        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json({
            success: true,
            data: {
                paymentStatus: order.paymentStatus,
                orderStatus: order.status,
            },
        });
    } catch (error) {
        next(error);
    }
};