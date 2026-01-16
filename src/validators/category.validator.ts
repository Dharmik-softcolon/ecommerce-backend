// backend/src/validators/category.validator.ts
import { z } from 'zod';
import mongoose from 'mongoose';

// Custom validator for MongoDB ObjectId
const objectIdSchema = z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid ID format' }
);

export const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Category name must be at least 2 characters')
            .max(100, 'Category name cannot exceed 100 characters')
            .trim(),
        description: z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .trim()
            .optional(),
        image: z
            .string()
            .url('Image must be a valid URL')
            .optional(),
        parentId: z
            .string()
            .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
                message: 'Invalid parent category ID',
            })
            .optional()
            .nullable(),
        isActive: z.boolean().default(true),
    }),
});

export const updateCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Category name must be at least 2 characters')
            .max(100, 'Category name cannot exceed 100 characters')
            .trim()
            .optional(),
        description: z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .trim()
            .optional()
            .nullable(),
        image: z
            .string()
            .url('Image must be a valid URL')
            .optional()
            .nullable(),
        parentId: z
            .string()
            .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
                message: 'Invalid parent category ID',
            })
            .optional()
            .nullable(),
        isActive: z.boolean().optional(),
    }),
    params: z.object({
        id: objectIdSchema,
    }),
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});

export const categorySlugParamSchema = z.object({
    params: z.object({
        slug: z.string().min(1, 'Slug is required'),
    }),
});

export const reorderCategoriesSchema = z.object({
    body: z.object({
        categories: z.array(
            z.object({
                id: objectIdSchema,
                order: z.number().int().nonnegative(),
            })
        ),
    }),
});