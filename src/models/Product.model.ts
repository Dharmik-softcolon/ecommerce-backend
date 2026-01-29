// src/models/Product.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import slugify from 'slugify';
import { IProduct, IProductImage, IProductVariant } from '../types';

const productImageSchema = new Schema<IProductImage>(
    {
        url: {
            type: String,
            required: true,
        },
        alt: {
            type: String,
        },
        position: {
            type: Number,
            default: 0,
        },
    },
    { _id: true }
);

const productVariantSchema = new Schema<IProductVariant>(
    {
        name: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
        size: {
            type: String,
        },
        color: {
            type: String,
        },
        colorHex: {
            type: String,
        },
    },
    { _id: true }
);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        shortDescription: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: [500, 'Short description cannot exceed 500 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        compareAtPrice: {
            type: Number,
            min: [0, 'Compare at price cannot be negative'],
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            uppercase: true,
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isBestseller: {
            type: Boolean,
            default: false,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
            index: true,
        },
        collection: {
            type: Schema.Types.ObjectId,
            ref: 'Collection',
            index: true,
        },
        images: [productImageSchema],
        variants: [productVariantSchema],
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        // We intentionally use paths named "isNew" and "collection" on this schema.
        // Suppress Mongoose reserved key warnings for these fields.
        suppressReservedKeysWarning: true,
    }
);

// Virtual for reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
    return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function () {
    if (this.variants && this.variants.length > 0) {
        return this.variants.some((v) => v.stock > 0);
    }
    return this.stock > 0;
});

// Generate slug before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Update average rating when reviews change
productSchema.statics.updateAverageRating = async function (productId: string) {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await this.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            reviewCount: stats[0].reviewCount,
        });
    } else {
        await this.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
};

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ collection: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNew: 1, isActive: 1 });
productSchema.index({ isBestseller: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default Product;