// src/validators/coupon.validator.ts
import { z } from 'zod';

export const createCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3, 'Coupon code is required'),
        description: z.string().optional(),
        discountType: z.enum(['PERCENTAGE', 'FIXED']),
        discountValue: z.number().positive('Discount value must be positive'),
        minOrderValue: z.number().positive().optional(),
        maxDiscount: z.number().positive().optional(),
        usageLimit: z.number().int().positive().optional(),
        isActive: z.boolean().default(true),
        startsAt: z.string().datetime().optional(),
        expiresAt: z.string().datetime().optional(),
    }),
});

export const updateCouponSchema = z.object({
    body: createCouponSchema.shape.body.partial(),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const applyCouponSchema = z.object({
    body: z.object({
        code: z.string().min(1, 'Coupon code is required'),
    }),
});