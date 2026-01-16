// src/models/Cart.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { ICart, ICartItem } from '../types';

const cartItemSchema = new Schema<ICartItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        variant: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1,
        },
    },
    {
        timestamps: true,
        _id: true,
    }
);

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function () {
    const items = this.items || [];
    const subtotal = items.reduce((acc: number, item: any) => {
        const price = item.variant?.price || item.product?.price || 0;
        return acc + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal >= 2999 ? 0 : 99;
    const total = subtotal + tax + shipping;
    const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping,
        total: Math.round(total * 100) / 100,
        itemCount,
    };
};

const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;