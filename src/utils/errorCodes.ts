// src/utils/errorCodes.ts
export const ErrorCodes = {
    // Authentication Errors
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // User Errors
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_EXISTS: 'USER_EXISTS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

    // Product Errors
    PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
    VARIANT_NOT_FOUND: 'VARIANT_NOT_FOUND',
    INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',

    // Order Errors
    ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
    ORDER_CANNOT_CANCEL: 'ORDER_CANNOT_CANCEL',
    CART_EMPTY: 'CART_EMPTY',

    // Payment Errors
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',

    // Coupon Errors
    COUPON_INVALID: 'COUPON_INVALID',
    COUPON_EXPIRED: 'COUPON_EXPIRED',
    COUPON_MIN_ORDER: 'COUPON_MIN_ORDER',

    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',

    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
};

export const ErrorMessages = {
    [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCodes.TOKEN_EXPIRED]: 'Token has expired',
    [ErrorCodes.TOKEN_INVALID]: 'Invalid token',
    [ErrorCodes.UNAUTHORIZED]: 'Authentication required',
    [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
    [ErrorCodes.USER_NOT_FOUND]: 'User not found',
    [ErrorCodes.USER_EXISTS]: 'User with this email already exists',
    [ErrorCodes.PRODUCT_NOT_FOUND]: 'Product not found',
    [ErrorCodes.VARIANT_NOT_FOUND]: 'Product variant not found',
    [ErrorCodes.INSUFFICIENT_STOCK]: 'Insufficient stock available',
    [ErrorCodes.ORDER_NOT_FOUND]: 'Order not found',
    [ErrorCodes.ORDER_CANNOT_CANCEL]: 'Order cannot be cancelled at this stage',
    [ErrorCodes.CART_EMPTY]: 'Your cart is empty',
    [ErrorCodes.PAYMENT_FAILED]: 'Payment processing failed',
    [ErrorCodes.COUPON_INVALID]: 'Invalid coupon code',
    [ErrorCodes.COUPON_EXPIRED]: 'Coupon has expired',
    [ErrorCodes.COUPON_MIN_ORDER]: 'Coupon requires minimum order amount',
    [ErrorCodes.VALIDATION_ERROR]: 'Validation failed',
    [ErrorCodes.INTERNAL_ERROR]: 'Internal server error',
    [ErrorCodes.DATABASE_ERROR]: 'Database error occurred',
};