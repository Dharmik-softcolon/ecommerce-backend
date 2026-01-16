// src/routes/collection.routes.ts
import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createCollectionSchema,
    updateCollectionSchema,
} from '../validators/collection.validator';

const router = Router();

// Public routes
router.get('/', collectionController.getCollections);
router.get('/:slug', collectionController.getCollection);
router.get('/by-id/:id', collectionController.getCollectionById);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate(createCollectionSchema),
    collectionController.createCollection
);
router.patch(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validate(updateCollectionSchema),
    collectionController.updateCollection
);
router.delete('/:id', authenticate, authorize('ADMIN'), collectionController.deleteCollection);

export default router;