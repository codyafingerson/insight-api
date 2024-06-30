import { Response } from "express";

/**
 * @class ResponseError - Throw custom errors with a status code and message to the response object.
 */
export default class ResponseError extends Error {
    /**
     * Default constructor.
     * @param {Response} res - Express response object that will be used to send the response.
     * @param {number} status - HTTP status code.
     * @param {string} message - Error message.
     */
    constructor(res: Response, status: number = 500, message: string) {
        super(message);
        res.status(status);
    }
}