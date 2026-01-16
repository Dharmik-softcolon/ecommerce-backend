// src/models/Newsletter.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { INewsletter } from '../types';

const newsletterSchema = new Schema<INewsletter>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const Newsletter: Model<INewsletter> = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter;