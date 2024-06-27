import crypto from "crypto";
import { type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User";
import MailService from "../util/MailService";

export default class AuthController {
    /**
     * Login a user.
     * This method logs in a user by checking the provided username and password, and sets a JWT token.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static loginUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: "Please provide both a username and password." });
            return;
        }

        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({ message: "Invalid username or password." });
            return;
        }

        if (user.isPasswordChangeRequired) {
            res.status(400).json({ isPasswordChangeRequired: true });
            return;
        }

        if (!user.isActive) {
            res.status(400).json({ message: "User is not active" });
            return;
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
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ message: "Invalid username or password." });
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
        res.status(200).json({ success: true });
    });

    /**
     * Get the current user.
     * This method retrieves the current user's details using the JWT token from the cookies.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     **/
    public static getCurrentUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
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
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    });

    /**
    * Request a password reset.
    * This method generates a password reset token and sends a password reset email to the user.
    * @param {Request} req - Express request object.
    * @param {Response} res - Express response object.
    */
    public static requestPasswordReset = expressAsyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            throw new Error("No user found with this email address.");
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
     * Reset a user's password.
     * This method resets a user's password in the database using the provided password reset token and new password.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400);
            throw new Error("Invalid or expired password reset token.");
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password has been reset." });
    });
}