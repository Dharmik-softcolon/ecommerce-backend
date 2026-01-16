// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, email: string): string => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '30d',
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET!);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};