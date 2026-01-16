// src/validators/product.validator.ts
import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Product name is required'),
        description: z.string().min(10, 'Description is required'),
        shortDescription: z.string().min(10, 'Short description is required'),
        price: z.number().positive('Price must be positive'),
        compareAtPrice: z.number().positive().optional(),
        sku: z.string().min(1, 'SKU is required'),
        stock: z.number().int().nonnegative().default(0),
        categoryId: z.string().min(1, 'Category is required'),
        collectionId: z.string().optional(),
        isActive: z.boolean().default(true),
        isNew: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
        isBestseller: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
        images: z
            .array(
                z.object({
                    url: z.string().url(),
                    alt: z.string().optional(),
                    position: z.number().int().nonnegative().default(0),
                })
            )
            .default([]),
        variants: z
            .array(
                z.object({
                    name: z.string(),
                    sku: z.string(),
                    price: z.number().positive(),
                    stock: z.number().int().nonnegative().default(0),
                    size: z.string().optional(),
                    color: z.string().optional(),
                    colorHex: z.string().optional(),
                })
            )
            .default([]),
    }),
});

export const updateProductSchema = z.object({
    body: createProductSchema.shape.body.partial(),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const productQuerySchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .transform((v) => (v ? parseInt(v) : 1)),
        limit: z
            .string()
            .optional()
            .transform((v) => (v ? parseInt(v) : 12)),
        sort: z
            .enum([
                'newest',
                'oldest',
                'price-asc',
                'price-desc',
                'name-asc',
                'name-desc',
                'bestselling',
            ])
            .optional(),
        category: z.string().optional(),
        collection: z.string().optional(),
        search: z.string().optional(),
        priceMin: z
            .string()
            .optional()
            .transform((v) => (v ? parseFloat(v) : undefined)),
        priceMax: z
            .string()
            .optional()
            .transform((v) => (v ? parseFloat(v) : undefined)),
        sizes: z.union([z.string(), z.array(z.string())]).optional(),
        colors: z.union([z.string(), z.array(z.string())]).optional(),
        isNew: z
            .string()
            .optional()
            .transform((v) => v === 'true'),
        isFeatured: z
            .string()
            .optional()
            .transform((v) => v === 'true'),
        isBestseller: z
            .string()
            .optional()
            .transform((v) => v === 'true'),
    }),
});