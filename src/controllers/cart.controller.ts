// src/controllers/cart.controller.ts
import { Response, NextFunction } from 'express';
import { Cart, Product } from '../models';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { calculateCartTotals } from '../utils/helpers';

export const getCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;

        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name slug price images category variants',
            populate: {
                path: 'category',
                select: 'name slug',
            },
        });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Map items with variant details
        const items = cart.items.map((item: any) => {
            const product = item.product;
            const variant = product?.variants?.find(
                (v: any) => v._id.toString() === item.variant.toString()
            );

            return {
                id: item._id,
                productId: product?._id,
                product: {
                    _id: product?._id,
                    name: product?.name,
                    slug: product?.slug,
                    images: product?.images,
                    category: product?.category,
                },
                variantId: item.variant,
                variant: variant || null,
                quantity: item.quantity,
                price: variant?.price || product?.price || 0,
            };
        });

        const totals = calculateCartTotals(items);

        res.json({
            success: true,
            data: {
                id: cart._id,
                items,
                ...totals,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { productId, variantId, quantity = 1 } = req.body;

        // Verify product and variant exist
        const product = await Product.findById(productId);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const variant = product.variants.find(
            (v) => v._id?.toString() === variantId
        );

        if (!variant) {
            throw new AppError('Product variant not found', 404);
        }

        if (variant.stock < quantity) {
            throw new AppError('Not enough stock available', 400);
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.variant.toString() === variantId
        );

        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > variant.stock) {
                throw new AppError('Not enough stock available', 400);
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                variant: variantId,
                quantity,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await cart.save();

        // Return updated cart
        return getCartResponse(cart._id, res);
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id?.toString() === itemId
        );

        if (itemIndex === -1) {
            throw new AppError('Cart item not found', 404);
        }

        const item = cart.items[itemIndex];

        // Verify stock
        const product = await Product.findById(item.product);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const variant = product.variants.find(
            (v) => v._id?.toString() === item.variant.toString()
        );

        if (variant && quantity > variant.stock) {
            throw new AppError('Not enough stock available', 400);
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].updatedAt = new Date();
        }

        await cart.save();

        // Return updated cart
        return getCartResponse(cart._id, res);
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id?.toString() === itemId
        );

        if (itemIndex === -1) {
            throw new AppError('Cart item not found', 404);
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        // Return updated cart
        return getCartResponse(cart._id, res);
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;

        await Cart.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                itemCount: 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to get formatted cart response
async function getCartResponse(cartId: any, res: Response) {
    const updatedCart = await Cart.findById(cartId).populate({
        path: 'items.product',
        select: 'name slug price images category variants',
        populate: {
            path: 'category',
            select: 'name slug',
        },
    });

    const items = updatedCart!.items.map((item: any) => {
        const prod = item.product;
        const variantData = prod?.variants?.find(
            (v: any) => v._id.toString() === item.variant.toString()
        );

        return {
            id: item._id,
            productId: prod?._id,
            product: {
                _id: prod?._id,
                name: prod?.name,
                slug: prod?.slug,
                images: prod?.images,
                category: prod?.category,
            },
            variantId: item.variant,
            variant: variantData || null,
            quantity: item.quantity,
            price: variantData?.price || prod?.price || 0,
        };
    });

    const totals = calculateCartTotals(items);

    return res.json({
        success: true,
        data: {
            id: updatedCart!._id,
            items,
            ...totals,
        },
    });
}