import type { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import UserResponse from '../types/UserResponse';

/**
 * Interface for authenticated requests that contain a user object.
 */
interface AuthenticatedRequest extends Request {
    user?: UserResponse
}

/**
 * Middleware to authenticate a user by verifying the JWT token in the request.
 */
export const authenticateUser = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { token } = req.signedCookies;

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
 * Middleware to authorize a user to access a protected route.
 * @param {UserRole[]} roles - The roles that the user must have to access the route.
 * @returns {Function} - The middleware function.
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
 * Middleware to check if the user is accessing their own data.
 */
export const selfCheck = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.params.id || req.body.id;

    if (req.user && req.user.id === userId) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: You can only access your own data.' });
    }
});