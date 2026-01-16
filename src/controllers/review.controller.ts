// src/controllers/review.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Review, Product, Order } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const productId = req.query.productId as string;

        const filter: any = {};
        if (productId) {
            filter.product = productId;
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .populate('user', 'firstName lastName avatar')
                .populate('product', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: reviews,
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

export const getReview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id)
            .populate('user', 'firstName lastName avatar')
            .populate('product', 'name slug');

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        res.json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

export const createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const { rating, title, content, images } = req.body;
        const userId = req.user!.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId,
        });

        if (existingReview) {
            throw new AppError('You have already reviewed this product', 409);
        }

        // Check if user has purchased this product (for verified review)
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: 'DELIVERED',
        });

        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            title,
            content,
            images: images || [],
            isVerified: !!hasPurchased,
        });

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'firstName lastName avatar');

        res.status(201).json({
            success: true,
            data: populatedReview,
        });
    } catch (error) {
        next(error);
    }
};

export const updateReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { rating, title, content, images } = req.body;
        const userId = req.user!.id;

        const review = await Review.findOne({ _id: id, user: userId });

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (rating !== undefined) review.rating = rating;
        if (title !== undefined) review.title = title;
        if (content !== undefined) review.content = content;
        if (images !== undefined) review.images = images;

        await review.save();

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'firstName lastName avatar');

        res.json({
            success: true,
            data: populatedReview,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const filter: any = { _id: id };
        // Only allow users to delete their own reviews unless admin
        if (userRole !== 'ADMIN') {
            filter.user = userId;
        }

        const review = await Review.findOneAndDelete(filter);

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getUserReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ user: userId })
                .populate('product', 'name slug images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ user: userId }),
        ]);

        res.json({
            success: true,
            data: reviews,
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