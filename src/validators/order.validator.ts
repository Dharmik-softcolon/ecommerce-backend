// src/validators/order.validator.ts
import { z } from 'zod';

const addressSchema = z.object({
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
});

export const createOrderSchema = z.object({
    body: z.object({
        shippingAddressId: z.string().optional(),
        shippingAddress: addressSchema.optional(),
        billingAddressId: z.string().optional(),
        billingAddress: addressSchema.optional(),
        sameAsShipping: z.boolean().default(true),
        paymentMethod: z.string().optional(),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum([
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
        ]),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const updatePaymentStatusSchema = z.object({
    body: z.object({
        paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
        paymentIntentId: z.string().optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});