import { type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User";

export default class AuthController {
    /**
     * Logout a user.
     * This method logs out a user by removing the JWT token from the user's cookies.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     **/
    public static getCurrentUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const token = req.cookies.token;

        jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: {
            id: any;
            isActive: boolean,
            isAdmin: any;
            username: any;
            firstName: any;
            lastName: any;
            email: any;
        }) => {
            if (err) {
                // If the token is invalid or expired, send an error response
                res.status(401).json({message: 'Invalid or expired token'});
            } else {
                // If the token is valid, extract the user's details
                const {id, isActive, isAdmin, username, firstName, lastName, email} = decoded;

                // Send the user's details in the response
                res.status(200).json({
                    id,
                    isActive,
                    isAdmin,
                    username,
                    firstName,
                    lastName,
                    email
                });
            }
        });
    })

    /**
     * Login a user.
     * This method logs in a user by checking the provided username and password, and sets a JWT token.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static loginUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const {username, password} = req.body;

        if (!username || !password) {
            res.status(400);
            throw new Error("Please provide both a username and password.");
        }

        const user = await User.findOne({username});

        if (user && user.isPasswordChangeRequired) {
            res.status(400).json({
                isPasswordChangeRequired: true
            });

            return;
        }

        if (!user.isActive) {
            res.status(400).json({
                message: "User is not active"
            });

            return;
        }

        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign(
                {
                    id: user._id,
                    isActive: user.isActive,
                    isAdmin: user.isAdmin,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                process.env.JWT_SECRET as string,
                {expiresIn: process.env.JWT_EXPIRE as string}
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 2 // 2 hours
            });

            res.status(200).json({
                id: user._id,
                isActive: user.isActive,
                isAdmin: user.isAdmin,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            });
        } else {
            res.status(401);
            throw new Error("Invalid username or password.");
        }
    });

    /**
     * Logout a user.
     * This method logs out a user by clearing the JWT token.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static logoutUser = expressAsyncHandler(async (req: Request, res: Response) => {
        res.clearCookie("token");
        res.status(200).json({success: true});
    });
}