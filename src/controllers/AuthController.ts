import crypto from "crypto";
import { type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User";
import MailService from "../util/MailService";
import ResponseError from "../util/ResponseError";

/**
 * Controller for handling authentication related requests.
 */
export default class AuthController {
    /**
     * Logs in a user by checking the provided username and password, and sets a JWT token.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static loginUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            throw new ResponseError(res, 400, "Please provide username and password.");
        }

        const user = await User.findOne({ username });

        if (!user) {
            throw new ResponseError(res, 404, "User not found.");
        }

        if (user.isPasswordChangeRequired) {
            res.status(400).json({ isPasswordChangeRequired: true });
            return;
        }

        if (!user.isActive) {
            throw new ResponseError(res, 400, "User is not active.");
        }

        if (await user.comparePassword(password)) {
            const token = jwt.sign(
                {
                    id: user._id,
                    isActive: user.isActive,
                    role: user.role,
                    username: user.username,
                },
                process.env.JWT_SECRET as string,
                { expiresIn: process.env.JWT_EXPIRE as string }
            );

            res.cookie("token", token, {
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 2 // 2 hours
            });

            res.status(200).json({
                user: {
                    id: user._id,
                    isActive: user.isActive,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    isPasswordChangeRequired: user.isPasswordChangeRequired
                }
            });
        } else {
            throw new ResponseError(res, 401, "Invalid credentials.");
        }
    });

    /**
     * Logs out a user by clearing the JWT token from the cookies.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static logoutUser = expressAsyncHandler(async (req: Request, res: Response) => {
        res.clearCookie("token");
        res.status(200).json({ success: true });
    });

    /**
     * Gets the current user by checking the JWT token.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     **/
    public static getCurrentUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const token = req.cookies.token;

        if (!token) {
            throw new ResponseError(res, 401, "No token provided.");
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            const { id } = decoded;

            const foundUser = await User.findById(id);

            if (foundUser) {
                res.status(200).json({
                    user: {
                        id: foundUser._id,
                        isActive: foundUser.isActive,
                        role: foundUser.role,
                        username: foundUser.username,
                        firstName: foundUser.firstName,
                        lastName: foundUser.lastName,
                        email: foundUser.email
                    }
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            throw new ResponseError(res, 401, "Invalid or expired token.");
        }
    });

    /**
    * Sends a password reset email to the user with a reset token.
    * @param {Request} req - Express request object.
    * @param {Response} res - Express response object.
    * @throws Will throw an error if no user is found with the provided email address.
    */
    public static requestPasswordReset = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw new ResponseError(res, 404, "No user found with this email address.");
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;

        await user.save();

        // Send reset email
        const mailService = new MailService();
        await mailService.sendMail(
            user.email,
            "Password Reset Request",
            "passwordReset",
            {
                resetLink: `http://localhost:8000/reset-password?token=${resetToken}`,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                expiresIn: user.resetPasswordExpires.toISOString(),
            }
        );

        res.status(200).json({ message: "Password reset email sent." });
    });

    /**
     * Resets the user's password with a new password.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @throws Will throw an error if the reset token is invalid or expired.
     */
    public static resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new ResponseError(res, 400, "Invalid or expired password reset token.");
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password has been reset." });
    });
}