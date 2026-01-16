// src/models/ContactMessage.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IContactMessage } from '../types';

const contactMessageSchema = new Schema<IContactMessage>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: 5000,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const ContactMessage: Model<IContactMessage> = mongoose.model<IContactMessage>(
    'ContactMessage',
    contactMessageSchema
);

export default ContactMessage;