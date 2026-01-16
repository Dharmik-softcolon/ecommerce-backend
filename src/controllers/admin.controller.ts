// src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import {
    User,
    Product,
    Order,
    Category,
    Collection,
    Review,
    Coupon,
    Newsletter,
    ContactMessage
} from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

// Dashboard stats
export const getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            thisMonthOrders,
            lastMonthOrders,
            thisMonthRevenue,
            lastMonthRevenue,
            recentOrders,
            lowStockProducts,
            pendingOrders,
        ] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { paymentStatus: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            }),
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: 'PAID',
                        createdAt: { $gte: startOfMonth },
                    },
                },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: 'PAID',
                        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                    },
                },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.find()
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(5),
            Product.find({ 'variants.stock': { $lt: 10 } })
                .select('name sku variants')
                .limit(10),
            Order.countDocuments({ status: 'PENDING' }),
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const thisMonthRev = thisMonthRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;

        const orderGrowth = lastMonthOrders
            ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
            : 0;
        const revenueGrowth = lastMonthRev
            ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100
            : 0;

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue: revenue,
                    pendingOrders,
                },
                growth: {
                    orders: Math.round(orderGrowth * 100) / 100,
                    revenue: Math.round(revenueGrowth * 100) / 100,
                },
                thisMonth: {
                    orders: thisMonthOrders,
                    revenue: thisMonthRev,
                },
                recentOrders,
                lowStockProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

// User management
export const getUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const role = req.query.role as string;

        const filter: any = {};
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) {
            filter.role = role.toUpperCase();
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users,
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

export const getUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get user's order count and total spent
        const orderStats = await Order.aggregate([
            { $match: { user: user._id, paymentStatus: 'PAID' } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0 },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { role, firstName, lastName, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { role, firstName, lastName, phone },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user!.id) {
            throw new AppError('You cannot delete your own account', 400);
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Coupon management
export const getCoupons = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [coupons, total] = await Promise.all([
            Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Coupon.countDocuments(),
        ]);

        res.json({
            success: true,
            data: coupons,
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

export const getCoupon = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }

        res.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const createCoupon = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coupon = await Coupon.create({
            ...req.body,
            code: req.body.code.toUpperCase(),
        });

        res.status(201).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCoupon = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }

        res.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }

        res.json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Validate coupon (public)
export const validateCoupon = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, orderValue } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
        });

        if (!coupon) {
            throw new AppError('Invalid coupon code', 404);
        }

        const validation = (coupon as any).isValid(orderValue || 0);

        if (!validation.valid) {
            throw new AppError(validation.message || 'Coupon is not valid', 400);
        }

        const discount = (coupon as any).calculateDiscount(orderValue || 0);

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                calculatedDiscount: discount,
                minOrderValue: coupon.minOrderValue,
                maxDiscount: coupon.maxDiscount,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Newsletter subscribers
export const getNewsletterSubscribers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [subscribers, total] = await Promise.all([
            Newsletter.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Newsletter.countDocuments(),
        ]);

        res.json({
            success: true,
            data: subscribers,
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

// Contact messages
export const getContactMessages = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const isRead = req.query.isRead as string;

        const filter: any = {};
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true';
        }

        const [messages, total] = await Promise.all([
            ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ContactMessage.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: messages,
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

export const markMessageAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            throw new AppError('Message not found', 404);
        }

        res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteContactMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findByIdAndDelete(id);

        if (!message) {
            throw new AppError('Message not found', 404);
        }

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};