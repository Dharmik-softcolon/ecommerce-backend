// src/models/Category.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import slugify from 'slugify';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Category name cannot exceed 100 characters'],
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
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {  // Add this field
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for subcategories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
});

// Virtual for products count
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
});

// Generate slug before saving
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Index for better query performance
categorySchema.index({ parent: 1 });

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;