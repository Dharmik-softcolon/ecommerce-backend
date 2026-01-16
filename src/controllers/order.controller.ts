// src/controllers/order.controller.ts
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, Cart, Product, Address, Coupon } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { generateOrderNumber, calculateCartTotals } from '../utils/helpers';
import { sendOrderConfirmationEmail } from '../services/email.service';

export const getOrders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        const filter: any = { user: userId };
        if (status) {
            filter.status = status.toUpperCase();
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate({
                    path: 'items.product',
                    select: 'name slug images',
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        // Support both order ID and order number
        const filter: any = { user: userId };
        if (mongoose.Types.ObjectId.isValid(id)) {
            filter._id = id;
        } else {
            filter.orderNumber = id;
        }

        const order = await Order.findOne(filter).populate({
            path: 'items.product',
            select: 'name slug images',
        });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const {
            shippingAddressId,
            shippingAddress: shippingAddressData,
            billingAddressId,
            billingAddress: billingAddressData,
            sameAsShipping = true,
            paymentMethod,
            couponCode,
            notes,
        } = req.body;

        // Get cart with populated items
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name slug price images variants',
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // Get shipping address
        let shippingAddress;
        if (shippingAddressId) {
            const address = await Address.findOne({
                _id: shippingAddressId,
                user: userId,
            });
            if (!address) {
                throw new AppError('Shipping address not found', 404);
            }
            shippingAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                company: address.company,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                phone: address.phone,
            };
        } else if (shippingAddressData) {
            shippingAddress = shippingAddressData;
        } else {
            throw new AppError('Shipping address is required', 400);
        }

        // Get billing address
        let billingAddress;
        if (sameAsShipping) {
            billingAddress = shippingAddress;
        } else if (billingAddressId) {
            const address = await Address.findOne({
                _id: billingAddressId,
                user: userId,
            });
            if (!address) {
                throw new AppError('Billing address not found', 404);
            }
            billingAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                company: address.company,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                phone: address.phone,
            };
        } else if (billingAddressData) {
            billingAddress = billingAddressData;
        } else {
            throw new AppError('Billing address is required', 400);
        }

        // Prepare order items and verify stock
        const orderItems = [];
        for (const item of cart.items) {
            const product = item.product as any;
            if (!product) {
                throw new AppError('Product not found in cart', 400);
            }

            const variant = product.variants?.find(
                (v: any) => v._id.toString() === item.variant.toString()
            );

            if (!variant) {
                throw new AppError(`Variant not found for product: ${product.name}`, 400);
            }

            if (variant.stock < item.quantity) {
                throw new AppError(
                    `Not enough stock for ${product.name} - ${variant.name}`,
                    400
                );
            }

            orderItems.push({
                product: product._id,
                variant: {
                    _id: variant._id,
                    name: variant.name,
                    sku: variant.sku,
                    size: variant.size,
                    color: variant.color,
                },
                quantity: item.quantity,
                price: variant.price,
            });
        }

        // Calculate totals
        const subtotal = orderItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        let discount = 0;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
            });

            if (coupon) {
                const validation = (coupon as any).isValid(subtotal);
                if (validation.valid) {
                    discount = (coupon as any).calculateDiscount(subtotal);
                    // Increment coupon usage
                    await Coupon.findByIdAndUpdate(coupon._id, {
                        $inc: { usedCount: 1 },
                    });
                }
            }
        }

        const tax = (subtotal - discount) * 0.18; // 18% GST
        const shipping = subtotal >= 2999 ? 0 : 99;
        const total = subtotal - discount + tax + shipping;

        // Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            user: userId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod,
            shippingAddress,
            billingAddress,
            items: orderItems,
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            shipping,
            discount: Math.round(discount * 100) / 100,
            total: Math.round(total * 100) / 100,
            couponCode: couponCode?.toUpperCase(),
            notes,
        });

        // Update product stock
        for (const item of orderItems) {
            await Product.updateOne(
                { _id: item.product, 'variants._id': item.variant._id },
                { $inc: { 'variants.$.stock': -item.quantity } }
            );
        }

        // Clear cart
        await Cart.findOneAndUpdate({ user: userId }, { items: [] });

        // Send confirmation email (async)
        const userDoc = await mongoose.model('User').findById(userId);
        if (userDoc?.email) {
            sendOrderConfirmationEmail(userDoc.email, order.orderNumber, {
                total: order.total,
            }).catch(console.error);
        }

        // Populate and return order
        const populatedOrder = await Order.findById(order._id).populate({
            path: 'items.product',
            select: 'name slug images',
        });

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, user: userId });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Only allow cancellation of pending or confirmed orders
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new AppError(
                'Order cannot be cancelled at this stage',
                400
            );
        }

        // Restore stock
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.product, 'variants._id': item.variant._id },
                { $inc: { 'variants.$.stock': item.quantity } }
            );
        }

        // Update order status
        order.status = 'CANCELLED';
        await order.save();

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate({
            path: 'items.product',
            select: 'name slug images',
        });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const updatePaymentStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentIntentId } = req.body;

        const updateData: any = { paymentStatus };
        if (paymentIntentId) {
            updateData.paymentIntentId = paymentIntentId;
        }

        // If payment is successful, confirm the order
        if (paymentStatus === 'PAID') {
            updateData.status = 'CONFIRMED';
        }

        const order = await Order.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Get all orders
export const getAllOrders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;
        const paymentStatus = req.query.paymentStatus as string;
        const search = req.query.search as string;

        const filter: any = {};
        if (status) filter.status = status.toUpperCase();
        if (paymentStatus) filter.paymentStatus = paymentStatus.toUpperCase();
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'email firstName lastName')
                .populate({
                    path: 'items.product',
                    select: 'name slug images',
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};