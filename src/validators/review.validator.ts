// src/validators/review.validator.ts
import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5),
        title: z.string().min(3, 'Title must be at least 3 characters'),
        content: z.string().min(10, 'Review must be at least 10 characters'),
        images: z.array(z.string().url()).optional(),
    }),
    params: z.object({
        productId: z.string().min(1),
    }),
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        title: z.string().min(3).optional(),
        content: z.string().min(10).optional(),
        images: z.array(z.string().url()).optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});