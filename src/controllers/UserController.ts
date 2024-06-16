import { type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User";
import MailService from "../util/MailService";

/**
 * UserController class
 * This class contains static methods for handling user-related operations.
 */
export default class UserController {
    /**
     * Create a new user.
     * This method creates a new user with the provided details, hashes the password, and sends a welcome email.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static createNewUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const {
            isActive,
            isAdmin,
            firstName,
            lastName,
            username,
            email,
            password,
        } = req.body;

        if (!firstName || !lastName || !username || !email || !password) {
            res.status(400);
            throw new Error("Please fill in all fields.");
        }

        const usernameExists = await User.findOne({ username });
        const emailExists = await User.findOne({ email });

        if (usernameExists) {
            res.status(400);
            throw new Error(`The username ${username} is already in use.`);
        } else if (emailExists) {
            res.status(400);
            throw new Error(`The email ${email} is already in use.`);
        }

        const newUser = new User({
            isActive,
            isAdmin,
            firstName,
            lastName,
            username,
            email,
            password
        });

        const createdUser = await newUser.save();

        if (createdUser) {
            if (createdUser.isActive) {
                createdUser.isPasswordChangeRequired = true;

                // Generate reset token
                const resetToken = crypto.randomBytes(20).toString("hex");
                const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

                createdUser.resetPasswordToken = resetToken;
                createdUser.resetPasswordExpires = resetTokenExpires;

                const mailService = new MailService();

                await mailService.sendMail(
                    createdUser.email,
                    "Welcome to the Insight CRM!",
                    "welcome",
                    {
                        resetLink: `http://localhost:8000/reset-password?token=${resetToken}`,
                        firstName: createdUser.firstName,
                        lastName: createdUser.lastName,
                        username: createdUser.username,
                        tempPassword: password,
                        email: createdUser.email,
                    }
                );
            }

            res.status(201).json({
                id: createdUser._id,
                isActive: createdUser.isActive,
                isAdmin: createdUser.isAdmin,
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
                username: createdUser.username,
                email: createdUser.email,
            });
        } else {
            res.status(400);
            throw new Error("Invalid user data.");
        }
    });

    /**
     * Get all users.
     * This method retrieves all users from the database.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
        const users = await User.find({}).select("-password");

        if (users) {
            const formattedUsers = users.map((user) => {
                return {
                    id: user._id,
                    isActive: user.isActive,
                    isAdmin: user.isAdmin,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email
                }
            });
            res.status(200).json(formattedUsers);
        } else {
            res.status(404);
            throw new Error("No users found.");
        }
    });

    /**
     * Get a user by ID.
     * This method retrieves a user from the database by their ID.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static getUserById = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const user = await User.findById(id).select("-password"); // Exclude the password field

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404);
            throw new Error(`No user found with the ID: ${id}`);
        }
    });

    /**
     * Update a user.
     * This method updates a user's details in the database.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            isActive,
            isAdmin,
            firstName,
            lastName,
            username,
            email,
            isPasswordChangeRequired,
        } = req.body;

        const user = await User.findById(id);

        if (user) {
            user.isActive = isActive || user.isActive;
            user.isAdmin = isAdmin || user.isAdmin;
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.username = username || user.username;
            user.email = email || user.email;
            user.isPasswordChangeRequired =
                isPasswordChangeRequired || user.isPasswordChangeRequired;

            const updatedUser = await user.save();

            res.status(200).json(updatedUser);
        } else {
            res.status(404);
            throw new Error(`No user found with the ID: ${id}`);
        }
    });

    /**
     * Search for users.
     * This method searches for users in the database based on the provided query parameters.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static searchUsers = expressAsyncHandler(async (req: Request, res: Response) => {
        const query = req.query;
        let searchCriteria: { [key: string]: { $regex: RegExp } } = {};

        // Build search criteria based on query parameters
        Object.keys(query).forEach((key) => {
            // Use regex for case-insensitive search
            searchCriteria[key] = { $regex: new RegExp(query[key] as string, "i") };
        });

        const users = await User.find(searchCriteria).select("-password");

        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404);
            throw new Error("No users found.");
        }
    });

    /**
     * Delete a user.
     * This method deletes a user from the database by their ID.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    public static deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (user) {
            res.status(200).json({
                message: `User ${user.firstName} ${user.lastName} has been deleted.`,
            });
        } else {
            res.status(404);
            throw new Error(`No user found with the ID: ${id}`);
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

    public static sendEmail = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { subject, body } = req.body;

        const user = await User.findById(id);

        if (user) {
            const mailService = new MailService();

            await mailService.sendMail(user.email, subject, "blank", { body });

            res.status(200).json({ message: "Email sent." });
        } else {
            res.status(404);
            throw new Error("User not found.");
        }
    });
}