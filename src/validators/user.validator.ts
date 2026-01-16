// src/validators/user.validator.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        phone: z.string().optional(),
        avatar: z.string().url().optional(),
    }),
});

export const createAddressSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        company: z.string().optional(),
        address1: z.string().min(1, 'Address is required'),
        address2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().default('India'),
        phone: z.string().min(1, 'Phone is required'),
        isDefault: z.boolean().default(false),
    }),
});

export const updateAddressSchema = z.object({
    body: createAddressSchema.shape.body.partial(),
    params: z.object({
        id: z.string().min(1),
    }),
});