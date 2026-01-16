// src/utils/responseHelpers.ts
import { Response } from 'express';

interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext?: boolean;
        hasPrev?: boolean;
    };
}

interface ErrorResponse {
    success: false;
    error: string;
    code?: string;
    details?: any;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string,
    pagination?: SuccessResponse<T>['pagination']
): Response => {
    const response: SuccessResponse<T> = {
        success: true,
        data,
    };

    if (message) response.message = message;
    if (pagination) response.pagination = pagination;

    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    error: string,
    statusCode: number = 500,
    code?: string,
    details?: any
): Response => {
    const response: ErrorResponse = {
        success: false,
        error,
    };

    if (code) response.code = code;
    if (details) response.details = details;

    return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
): Response => {
    const totalPages = Math.ceil(total / limit);

    return res.status(statusCode).json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    });
};