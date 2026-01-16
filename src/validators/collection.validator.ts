// src/validators/collection.validator.ts
import { z } from 'zod';

export const createCollectionSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Collection name is required'),
        description: z.string().optional(),
        image: z.string().url().optional(),
        isActive: z.boolean().default(true),
    }),
});

export const updateCollectionSchema = z.object({
    body: createCollectionSchema.shape.body.partial(),
    params: z.object({
        id: z.string().min(1),
    }),
});