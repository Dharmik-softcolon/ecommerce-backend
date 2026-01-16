// src/models/Wishlist.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IWishlist } from '../types';

const wishlistSchema = new Schema<IWishlist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound unique index - one wishlist entry per user per product
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>('Wishlist', wishlistSchema);

export default Wishlist;