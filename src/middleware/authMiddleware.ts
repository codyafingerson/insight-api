import type { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import UserResponse from '../types/UserResponse';

interface AuthenticatedRequest extends Request {
    user?: UserResponse
}

/**
 * Protected route middleware.
 * This middleware checks for a token in the request cookies and verifies its validity.
 */
export const authenticateUser = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Authorization failed, no token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        req.user = await User.findById((decoded as any).id).select('-password') as UserResponse;

        if (!req.user) {
            res.status(401).json({ message: 'Authorization failed, user not found' });
            return;
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Authorization failed, token verification unsuccessful' });
        return;
    }
});

/**
 * Authorize users by their roles
 * 
 * @param {UserRole[]} roles user roles to authorize
 */
export const authorizeRole = (roles: UserRole[]) => {
    return expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }

        // Ensure that all users with the SystemAdmin role can access any protected route
        if (req.user.role === UserRole.SystemAdmin) {
            next();
            return;
        } else if (roles.includes(req.user.role)) {
            next();
            return;
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
            return;
        }
    });
};

/**
 * Self-check middleware.
 * This middleware checks if the user is accessing their own data.
 *
 * @param {AuthenticatedRequest} req request object
 * @param res response object
 * @param next next function
 */
export const selfCheck = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.params.id || req.body.id;

    if (req.user && req.user.id === userId) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: You can only access your own data.' });
    }
});