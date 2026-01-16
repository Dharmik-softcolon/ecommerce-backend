// src/utils/helpers.ts
import crypto from 'crypto';

export const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const calculateCartTotals = (items: any[]) => {
    const subtotal = items.reduce((acc, item) => {
        const price = item.variant?.price || item.product?.price || 0;
        return acc + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal >= 2999 ? 0 : 99;
    const total = subtotal + tax + shipping;
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping,
        total: Math.round(total * 100) / 100,
        itemCount,
    };
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};