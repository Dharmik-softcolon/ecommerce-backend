// src/controllers/collection.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Collection, Product } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import slugify from 'slugify';

export const getCollections = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { includeInactive } = req.query;

        const filter: any = {};
        if (includeInactive !== 'true') {
            filter.isActive = true;
        }

        const collections = await Collection.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        // Add product count for each collection
        const collectionsWithCount = await Promise.all(
            collections.map(async (collection) => {
                const productCount = await Product.countDocuments({
                    collection: collection._id,
                    isActive: true,
                });
                return { ...collection, productCount };
            })
        );

        res.json({
            success: true,
            data: collectionsWithCount,
        });
    } catch (error) {
        next(error);
    }
};

export const getCollection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { slug } = req.params;

        const collection = await Collection.findOne({ slug });

        if (!collection) {
            throw new AppError('Collection not found', 404);
        }

        const productCount = await Product.countDocuments({
            collection: collection._id,
            isActive: true,
        });

        res.json({
            success: true,
            data: { ...collection.toObject(), productCount },
        });
    } catch (error) {
        next(error);
    }
};

export const getCollectionById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const collection = await Collection.findById(id);

        if (!collection) {
            throw new AppError('Collection not found', 404);
        }

        res.json({
            success: true,
            data: collection,
        });
    } catch (error) {
        next(error);
    }
};

export const createCollection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, description, image, isActive } = req.body;

        const slug = slugify(name, { lower: true, strict: true });

        const collection = await Collection.create({
            name,
            slug,
            description,
            image,
            isActive,
        });

        res.status(201).json({
            success: true,
            data: collection,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCollection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });
        }

        const collection = await Collection.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!collection) {
            throw new AppError('Collection not found', 404);
        }

        res.json({
            success: true,
            data: collection,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCollection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // Remove collection reference from products
        await Product.updateMany(
            { collection: id },
            { $unset: { collection: 1 } }
        );

        const collection = await Collection.findByIdAndDelete(id);

        if (!collection) {
            throw new AppError('Collection not found', 404);
        }

        res.json({
            success: true,
            message: 'Collection deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};