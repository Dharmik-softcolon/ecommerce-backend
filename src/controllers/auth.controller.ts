// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, Cart } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service';
import { hashToken } from '../utils/helpers';
import { AuthRequest } from '../types';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new AppError('User with this email already exists', 409);
        }

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
        });

        // Create empty cart for user
        await Cart.create({ user: user._id, items: [] });

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString());

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(user.email, user.firstName).catch(console.error);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.password) {
            throw new AppError('Invalid email or password', 401);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString());

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            throw new AppError('Refresh token required', 400);
        }

        const decoded = verifyRefreshToken(token) as { userId: string };

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const newRefreshToken = generateRefreshToken(user._id.toString());

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists, a reset link has been sent',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(resetToken);

        // Save hashed token to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save({ validateBeforeSave: false });

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            throw new AppError('Error sending email. Try again later.', 500);
        }

        res.json({
            success: true,
            message: 'If an account exists, a reset link has been sent',
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token, password } = req.body;

        const hashedToken = hashToken(token);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new AppError('Token is invalid or has expired', 400);
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Generate new tokens
        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString());

        res.json({
            success: true,
            message: 'Password reset successfully',
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user!.id;

        const user = await User.findById(userId).select('+password');

        if (!user || !user.password) {
            throw new AppError('User not found', 404);
        }

        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user!.id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, firstName, lastName, avatar, providerId } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                firstName,
                lastName,
                avatar,
                provider: 'google',
                providerId,
                emailVerified: new Date(),
            });

            // Create empty cart for new user
            await Cart.create({ user: user._id, items: [] });
        }

        const accessToken = generateAccessToken(user._id.toString(), user.email);
        const refreshToken = generateRefreshToken(user._id.toString());

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};