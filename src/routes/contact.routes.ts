// src/routes/contact.routes.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { ContactMessage } from '../models';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = contactSchema.safeParse(req.body);

        if (!validation.success) {
            throw new AppError(validation.error.errors[0].message, 400);
        }

        const { name, email, phone, subject, message } = validation.data;

        await ContactMessage.create({
            name,
            email: email.toLowerCase(),
            phone,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent. We will get back to you soon.',
        });
    } catch (error) {
        next(error);
    }
});

export default router;