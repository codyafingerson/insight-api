import jwt from 'jsonwebtoken';
import type { NextFunction, Response, Request } from 'express';
import User from '../models/User';
import expressAsyncHandler from 'express-async-handler';

interface AuthenticatedRequest extends Request {
    user?: any;
}

/**
 * Protected route middleware.
 * This middleware checks for a token in the request cookies and verifies its validity.
 */
export const protect = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Authorization failed, no token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        req.user = await User.findById((decoded as any).id).select('-password');

        if (!req.user) {
            res.status(401).json({ message: 'Authorization failed, user not found' });
            return;
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Authorization failed, token verification unsuccessful' });
    }
});

/**
 * Check if user is an admin by checking the decoded token for admin privileges.
 *
 * @param {AuthenticatedRequest} req request object
 * @param res response object
 * @param next next function
 */
export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin privileges required.' });
    }
};