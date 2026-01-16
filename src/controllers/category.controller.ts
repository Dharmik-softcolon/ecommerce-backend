// backend/src/controllers/category.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Category, Product } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import slugify from 'slugify';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { parent, includeInactive, flat } = req.query;

        const filter: any = {};

        // Filter by parent
        if (parent === 'null' || parent === 'root' || parent === '') {
            filter.parent = null;
        } else if (parent) {
            filter.parent = parent;
        }

        // Only show active categories for public requests
        if (includeInactive !== 'true') {
            filter.isActive = true;
        }

        let query = Category.find(filter).sort({ name: 1 });

        // Optionally populate children
        if (flat !== 'true') {
            query = query.populate({
                path: 'children',
                match: includeInactive !== 'true' ? { isActive: true } : {},
                options: { sort: { name: 1 } },
            });
        }

        const categories = await query.lean();

        // Add product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({
                    category: category._id,
                    isActive: true,
                });
                return { ...category, productCount };
            })
        );

        res.json({
            success: true,
            data: categoriesWithCount,
            count: categoriesWithCount.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get categories in tree structure
 * @route   GET /api/categories/tree
 * @access  Public
 */
export const getCategoryTree = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { includeInactive } = req.query;

        const filter: any = { parent: null };
        if (includeInactive !== 'true') {
            filter.isActive = true;
        }

        // Get root categories with nested children
        const categories = await Category.find(filter)
            .populate({
                path: 'children',
                match: includeInactive !== 'true' ? { isActive: true } : {},
                populate: {
                    path: 'children',
                    match: includeInactive !== 'true' ? { isActive: true } : {},
                },
            })
            .sort({ name: 1 })
            .lean();

        // Recursively add product counts
        const addProductCounts = async (cats: any[]): Promise<any[]> => {
            return Promise.all(
                cats.map(async (cat) => {
                    const productCount = await Product.countDocuments({
                        category: cat._id,
                        isActive: true,
                    });

                    let children = cat.children || [];
                    if (children.length > 0) {
                        children = await addProductCounts(children);
                    }

                    return {
                        ...cat,
                        productCount,
                        children,
                    };
                })
            );
        };

        const categoriesWithCounts = await addProductCounts(categories);

        res.json({
            success: true,
            data: categoriesWithCounts,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
export const getCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug })
            .populate('parent', 'name slug')
            .populate({
                path: 'children',
                match: { isActive: true },
                select: 'name slug image',
            });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Get product count
        const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true,
        });

        // Get price range for products in this category
        const priceStats = await Product.aggregate([
            { $match: { category: category._id, isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                ...category.toObject(),
                productCount,
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/by-id/:id
 * @access  Public
 */
export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid category ID', 400);
        }

        const category = await Category.findById(id)
            .populate('parent', 'name slug')
            .populate({
                path: 'children',
                select: 'name slug image isActive',
            });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true,
        });

        res.json({
            success: true,
            data: {
                ...category.toObject(),
                productCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products in a category
 * @route   GET /api/categories/:slug/products
 * @access  Public
 */
export const getCategoryProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { slug } = req.params;
        const {
            page = 1,
            limit = 12,
            sort = 'newest',
            priceMin,
            priceMax,
            sizes,
            colors,
        } = req.query;

        // Find category
        const category = await Category.findOne({ slug, isActive: true });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter: any = {
            category: category._id,
            isActive: true,
        };

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

        // Build sort
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
            case 'rating':
                sortQuery = { averageRating: -1 };
                break;
        }

        // Execute queries
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .select('-description')
                .lean(),
            Product.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                category: {
                    _id: category._id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    image: category.image,
                },
                products,
            },
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

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin
 */
export const createCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, description, image, parentId, isActive = true } = req.body;

        // Generate slug
        const slug = slugify(name, { lower: true, strict: true });

        // Check if slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            throw new AppError('A category with this name already exists', 409);
        }

        // Validate parent if provided
        if (parentId) {
            const parentCategory = await Category.findById(parentId);
            if (!parentCategory) {
                throw new AppError('Parent category not found', 404);
            }
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            parent: parentId || null,
            isActive,
        });

        // Populate parent for response
        await category.populate('parent', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a category
 * @route   PATCH /api/categories/:id
 * @access  Admin
 */
export const updateCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid category ID', 400);
        }

        // Update slug if name is changed
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });

            // Check if new slug already exists (excluding current category)
            const existingCategory = await Category.findOne({
                slug: updateData.slug,
                _id: { $ne: id },
            });
            if (existingCategory) {
                throw new AppError('A category with this name already exists', 409);
            }
        }

        // Handle parent ID
        if (updateData.parentId !== undefined) {
            if (updateData.parentId === id) {
                throw new AppError('A category cannot be its own parent', 400);
            }

            if (updateData.parentId) {
                const parentCategory = await Category.findById(updateData.parentId);
                if (!parentCategory) {
                    throw new AppError('Parent category not found', 404);
                }
                updateData.parent = updateData.parentId;
            } else {
                updateData.parent = null;
            }
            delete updateData.parentId;
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('parent', 'name slug')
            .populate('children', 'name slug');

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
export const deleteCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { force } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid category ID', 400);
        }

        // Check if category has products
        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0 && force !== 'true') {
            throw new AppError(
                `Cannot delete category with ${productCount} products. Remove or reassign products first, or use force=true to delete anyway.`,
                400
            );
        }

        // Check if category has children
        const childCount = await Category.countDocuments({ parent: id });
        if (childCount > 0) {
            throw new AppError(
                `Cannot delete category with ${childCount} subcategories. Remove subcategories first.`,
                400
            );
        }

        // If force delete, unset category from products
        if (force === 'true' && productCount > 0) {
            await Product.updateMany(
                { category: id },
                { $unset: { category: 1 } }
            );
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.json({
            success: true,
            message: 'Category deleted successfully',
            data: {
                deletedCategory: category.name,
                productsAffected: force === 'true' ? productCount : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle category active status
 * @route   PATCH /api/categories/:id/toggle-status
 * @access  Admin
 */
export const toggleCategoryStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid category ID', 400);
        }

        const category = await Category.findById(id);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        category.isActive = !category.isActive;
        await category.save();

        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder categories
 * @route   POST /api/categories/reorder
 * @access  Admin
 */
export const reorderCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { categories } = req.body;

        if (!Array.isArray(categories)) {
            throw new AppError('Categories must be an array', 400);
        }

        // Update each category's order/position
        const updatePromises = categories.map((item: { id: string; order: number }, index: number) => {
            return Category.findByIdAndUpdate(
                item.id,
                { order: item.order ?? index },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: 'Categories reordered successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get category breadcrumbs
 * @route   GET /api/categories/:slug/breadcrumbs
 * @access  Public
 */
export const getCategoryBreadcrumbs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug }).populate('parent');

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const breadcrumbs: Array<{ name: string; slug: string }> = [];

        // Build breadcrumbs from parent to current
        const buildBreadcrumbs = async (cat: any) => {
            if (cat.parent) {
                const parent = await Category.findById(cat.parent);
                if (parent) {
                    await buildBreadcrumbs(parent);
                }
            }
            breadcrumbs.push({
                name: cat.name,
                slug: cat.slug,
            });
        };

        await buildBreadcrumbs(category);

        res.json({
            success: true,
            data: breadcrumbs,
        });
    } catch (error) {
        next(error);
    }
};