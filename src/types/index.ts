// src/types/index.ts
import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User types
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    emailVerified?: Date;
    provider: 'credentials' | 'google' | 'facebook';
    providerId?: string;
    role: 'USER' | 'ADMIN';
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    fullName: string;
}

// Address types
export interface IAddress extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Category types
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent?: Types.ObjectId;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// Collection types
export interface ICollection extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Product types
export interface IProductImage {
    url: string;
    alt?: string;
    position: number;
}

export interface IProductVariant {
    _id?: Types.ObjectId;
    name: string;
    sku: string;
    price: number;
    stock: number;
    size?: string;
    color?: string;
    colorHex?: string;
}

// @ts-ignore
export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    stock: number;
    isActive: boolean;
    isNew: boolean;
    isFeatured: boolean;
    isBestseller: boolean;
    tags: string[];
    category: Types.ObjectId;
    collection?: Types.ObjectId;
    images: IProductImage[];
    variants: IProductVariant[];
    averageRating: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Review types
export interface IReview extends Document {
    _id: Types.ObjectId;
    product: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    title: string;
    content: string;
    images: string[];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Wishlist types
export interface IWishlist extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    product: Types.ObjectId;
    createdAt: Date;
}

// Cart types
export interface ICartItem {
    _id?: Types.ObjectId;
    product: Types.ObjectId;
    variant: Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICart extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface IOrderItem {
    product: Types.ObjectId;
    variant: {
        _id: Types.ObjectId;
        name: string;
        sku: string;
        size?: string;
        color?: string;
    };
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    _id: Types.ObjectId;
    orderNumber: string;
    user: Types.ObjectId;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paymentIntentId?: string;
    shippingAddress: IAddress;
    billingAddress: IAddress;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    couponCode?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Coupon types
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface ICoupon extends Document {
    _id: Types.ObjectId;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    startsAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Newsletter types
export interface INewsletter extends Document {
    _id: Types.ObjectId;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

// Contact types
export interface IContactMessage extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

// Auth Request type
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}