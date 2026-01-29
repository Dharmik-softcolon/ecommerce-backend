// src/routes/newsletter.routes.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { Newsletter } from '../models';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email is required', 400);
        }

        const existing = await Newsletter.findOne({ email: email.toLowerCase() });

        if (existing) {
            if (existing.isActive) {
                return res.json({
                    success: true,
                    message: 'You are already subscribed',
                });
            } else {
                existing.isActive = true;
                await existing.save();
                return res.json({
                    success: true,
                    message: 'Successfully re-subscribed to newsletter',
                });
            }
        }

        await Newsletter.create({ email: email.toLowerCase() });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
        });
    } catch (error) {
        next(error);
    }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email is required', 400);
        }

        const subscriber = await Newsletter.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isActive: false },
            { new: true }
        );

        if (!subscriber) {
            throw new AppError('Email not found in subscribers', 404);
        }

        res.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter',
        });
    } catch (error) {
        next(error);
    }
});

export default router;