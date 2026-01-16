// src/models/Coupon.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ICoupon } from '../types';

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['PERCENTAGE', 'FIXED'],
            required: [true, 'Discount type is required'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative'],
        },
        minOrderValue: {
            type: Number,
            min: 0,
        },
        maxDiscount: {
            type: Number,
            min: 0,
        },
        usageLimit: {
            type: Number,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        startsAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderValue: number): { valid: boolean; message?: string } {
    const now = new Date();

    if (!this.isActive) {
        return { valid: false, message: 'Coupon is not active' };
    }

    if (this.startsAt && now < this.startsAt) {
        return { valid: false, message: 'Coupon is not yet valid' };
    }

    if (this.expiresAt && now > this.expiresAt) {
        return { valid: false, message: 'Coupon has expired' };
    }

    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (this.minOrderValue && orderValue < this.minOrderValue) {
        return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required` };
    }

    return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderValue: number): number {
    let discount = 0;

    if (this.discountType === 'PERCENTAGE') {
        discount = (orderValue * this.discountValue) / 100;
        if (this.maxDiscount) {
            discount = Math.min(discount, this.maxDiscount);
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, orderValue);
};

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;