// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product, Category, Collection, Review, Order } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import slugify from 'slugify';

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = 'newest',
            category,
            collection,
            search,
            priceMin,
            priceMax,
            sizes,
            colors,
            isNew,
            isFeatured,
            isBestseller,
        } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter query
        const filter: any = { isActive: true };

        // Category filter
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            }
        }

        // Collection filter
        if (collection) {
            const collectionDoc = await Collection.findOne({ slug: collection });
            if (collectionDoc) {
                filter.collection = collectionDoc._id;
            }
        }

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search as string, 'i')] } },
            ];
        }

        // Price filter
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = Number(priceMin);
            if (priceMax) filter.price.$lte = Number(priceMax);
        }

        // Size filter
        if (sizes) {
            const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
            filter['variants.size'] = { $in: sizeArray };
            filter['variants.stock'] = { $gt: 0 };
        }

        // Color filter
        if (colors) {
            const colorArray = Array.isArray(colors) ? colors : [colors];
            filter['variants.color'] = { $in: colorArray };
            filter['variants.stock'] = { $gt: 0 };
        }

        // Boolean filters
        if (isNew === 'true') filter.isNew = true;
        if (isFeatured === 'true') filter.isFeatured = true;
        if (isBestseller === 'true') filter.isBestseller = true;

        // Build sort query
        let sortQuery: any = { createdAt: -1 };
        switch (sort) {
            case 'oldest':
                sortQuery = { createdAt: 1 };
                break;
            case 'price-asc':
                sortQuery = { price: 1 };
                break;
            case 'price-desc':
                sortQuery = { price: -1 };
                break;
            case 'name-asc':
                sortQuery = { name: 1 };
                break;
            case 'name-desc':
                sortQuery = { name: -1 };
                break;
            case 'bestselling':
                sortQuery = { isBestseller: -1, createdAt: -1 };
                break;
        }

        // Execute queries
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug')
                .populate('collection', 'name slug')
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug })
            .populate('category', 'name slug')
            .populate('collection', 'name slug')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'firstName lastName avatar',
                },
                options: { sort: { createdAt: -1 }, limit: 10 },
            });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('category', 'name slug')
            .populate('collection', 'name slug');

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const getFeaturedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const limit = parseInt(req.query.limit as string) || 8;

        const products = await Product.find({
            isActive: true,
            isFeatured: true,
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const getNewArrivals = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const limit = parseInt(req.query.limit as string) || 12;

        const products = await Product.find({
            isActive: true,
            isNew: true,
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const getBestsellers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const limit = parseInt(req.query.limit as string) || 8;

        const products = await Product.find({
            isActive: true,
            isBestseller: true,
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const getRelatedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 4;

        const product = await Product.findById(id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const relatedProducts = await Product.find({
            _id: { $ne: id },
            isActive: true,
            $or: [
                { category: product.category },
                { tags: { $in: product.tags } },
            ],
        })
            .populate('category', 'name slug')
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: relatedProducts,
        });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { q } = req.query;
        const limit = parseInt(req.query.limit as string) || 10;

        if (!q || typeof q !== 'string') {
            return res.json({ success: true, data: [] });
        }

        const products = await Product.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } },
            ],
        })
            .populate('category', 'name slug')
            .select('name slug price images category')
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            compareAtPrice,
            sku,
            stock,
            categoryId,
            collectionId,
            isActive,
            isNew,
            isFeatured,
            isBestseller,
            tags,
            images,
            variants,
        } = req.body;

        const slug = slugify(name, { lower: true, strict: true });

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            throw new AppError('A product with this name already exists', 409);
        }

        const product = await Product.create({
            name,
            slug,
            description,
            shortDescription,
            price,
            compareAtPrice,
            sku,
            stock,
            category: categoryId,
            collection: collectionId,
            isActive,
            isNew,
            isFeatured,
            isBestseller,
            tags,
            images,
            variants,
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name slug')
            .populate('collection', 'name slug');

        res.status(201).json({
            success: true,
            data: populatedProduct,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Update slug if name changed
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });
        }

        // Handle category and collection IDs
        if (updateData.categoryId) {
            updateData.category = updateData.categoryId;
            delete updateData.categoryId;
        }
        if (updateData.collectionId) {
            updateData.collection = updateData.collectionId;
            delete updateData.collectionId;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('category', 'name slug')
            .populate('collection', 'name slug');

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Delete related reviews
        await Review.deleteMany({ product: id });

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getProductReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ product: productId })
                .populate('user', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ product: productId }),
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

export const createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const { rating, title, content, images } = req.body;
        const userId = req.user!.id;

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
            images,
            isVerified: !!hasPurchased,
        });

        const populatedReview = await Review.findById(review._id).populate(
            'user',
            'firstName lastName avatar'
        );

        res.status(201).json({
            success: true,
            data: populatedReview,
        });
    } catch (error) {
        next(error);
    }
};