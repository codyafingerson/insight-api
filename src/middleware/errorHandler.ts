import { type NextFunction, type Request, type Response } from 'express';

/**
 * Error handling middleware for Express applications.
 *
 * This middleware function captures any errors that occur during the request-response cycle
 * and sends a JSON response with the error message and stack trace (in development mode).
 * This middleware should be the last middleware in the stack and come after route declaration.
 *
 * @param {Error} err - The error object that was thrown.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 *
 * @returns {void} This function does not return a value.
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;