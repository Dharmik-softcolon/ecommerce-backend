// src/models/Review.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IReview } from '../types';

const reviewSchema = new Schema<IReview>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5'],
        },
        title: {
            type: String,
            required: [true, 'Review title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        content: {
            type: String,
            required: [true, 'Review content is required'],
            trim: true,
            maxlength: [2000, 'Content cannot exceed 2000 characters'],
        },
        images: [{
            type: String,
        }],
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index - one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating after saving review
reviewSchema.post('save', async function () {
    const Product = mongoose.model('Product');
    await (Product as any).updateAverageRating(this.product);
});

// Update product rating after removing review
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const Product = mongoose.model('Product');
        await (Product as any).updateAverageRating(doc.product);
    }
});

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);

export default Review;