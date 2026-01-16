// src/controllers/user.controller.ts
import { Response, NextFunction } from 'express';
import { User, Address, Order, Wishlist } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user!.id);

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

export const updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { firstName, lastName, phone, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user!.id,
            { firstName, lastName, phone, avatar },
            { new: true, runValidators: true }
        );

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

export const getAddresses = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const addresses = await Address.find({ user: req.user!.id }).sort({
            isDefault: -1,
            createdAt: -1,
        });

        res.json({
            success: true,
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const getAddress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user!.id,
        });

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        res.json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const createAddress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const address = await Address.create({
            ...req.body,
            user: req.user!.id,
        });

        res.status(201).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user!.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        res.json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user!.id,
        });

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        res.json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const setDefaultAddress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Remove default from all addresses
        await Address.updateMany(
            { user: req.user!.id },
            { isDefault: false }
        );

        // Set new default
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user!.id },
            { isDefault: true },
            { new: true }
        );

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        res.json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const wishlist = await Wishlist.find({ user: req.user!.id })
            .populate({
                path: 'product',
                populate: [
                    { path: 'category', select: 'name slug' },
                    { path: 'images', options: { sort: { position: 1 }, limit: 1 } },
                ],
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: wishlist.map((item) => item.product),
        });
    } catch (error) {
        next(error);
    }
};

export const addToWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.body;

        const existing = await Wishlist.findOne({
            user: req.user!.id,
            product: productId,
        });

        if (existing) {
            return res.json({
                success: true,
                message: 'Product already in wishlist',
            });
        }

        await Wishlist.create({
            user: req.user!.id,
            product: productId,
        });

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await Wishlist.findOneAndDelete({
            user: req.user!.id,
            product: req.params.productId,
        });

        if (!result) {
            throw new AppError('Product not in wishlist', 404);
        }

        res.json({
            success: true,
            message: 'Product removed from wishlist',
        });
    } catch (error) {
        next(error);
    }
};

export const checkWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const item = await Wishlist.findOne({
            user: req.user!.id,
            product: req.params.productId,
        });

        res.json({
            success: true,
            data: { isInWishlist: !!item },
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user!.id })
                .populate({
                    path: 'items.product',
                    select: 'name slug images',
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ user: req.user!.id }),
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