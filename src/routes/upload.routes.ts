// src/routes/upload.routes.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';
import { uploadToS3, getPresignedUploadUrl, deleteFromS3 } from '../services/upload.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

// Upload single image
router.post('/image', uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const folder = (req.query.folder as string) || 'uploads';
        const imageUrl = await uploadToS3(req.file, folder);

        res.json({
            success: true,
            data: { url: imageUrl },
        });
    } catch (error) {
        next(error);
    }
});

// Upload multiple images
router.post('/images', uploadMultiple, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new AppError('No files uploaded', 400);
        }

        const folder = (req.query.folder as string) || 'uploads';
        const uploadPromises = req.files.map((file: Express.Multer.File) =>
            uploadToS3(file, folder)
        );
        const imageUrls = await Promise.all(uploadPromises);

        res.json({
            success: true,
            data: { urls: imageUrls },
        });
    } catch (error) {
        next(error);
    }
});

// Get presigned upload URL (for direct client upload)
router.post('/presigned-url', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName, fileType, folder } = req.body;

        if (!fileName || !fileType) {
            throw new AppError('fileName and fileType are required', 400);
        }

        const { uploadUrl, fileUrl } = await getPresignedUploadUrl(
            fileName,
            fileType,
            folder || 'uploads'
        );

        res.json({
            success: true,
            data: { uploadUrl, fileUrl },
        });
    } catch (error) {
        next(error);
    }
});

// Delete image (admin only)
router.delete('/image', authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.body;

        if (!url) {
            throw new AppError('Image URL is required', 400);
        }

        await deleteFromS3(url);

        res.json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;