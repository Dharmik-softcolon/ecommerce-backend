// src/routes/user.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    updateProfileSchema,
    createAddressSchema,
    updateAddressSchema,
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

// Addresses
router.get('/addresses', userController.getAddresses);
router.get('/addresses/:id', userController.getAddress);
router.post('/addresses', validate(createAddressSchema), userController.createAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);
router.patch('/addresses/:id/default', userController.setDefaultAddress);

// Wishlist
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);
router.get('/wishlist/:productId/check', userController.checkWishlist);

// Order history
router.get('/orders', userController.getOrderHistory);

export default router;