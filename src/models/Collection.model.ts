// src/models/Collection.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import slugify from 'slugify';
import { ICollection } from '../types';

const collectionSchema = new Schema<ICollection>(
    {
        name: {
            type: String,
            required: [true, 'Collection name is required'],
            trim: true,
            maxlength: [100, 'Collection name cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for products
collectionSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'collection',
});

// Generate slug before saving
collectionSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const Collection: Model<ICollection> = mongoose.model<ICollection>('Collection', collectionSchema);

export default Collection;