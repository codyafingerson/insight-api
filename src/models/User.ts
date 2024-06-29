import bcrypt from "bcryptjs";
import mongoose, { Document, Schema, Model, Types } from "mongoose";
import validator from "validator";

/**
 * Enum representing user roles.
 * @enum {string}
 */
export enum UserRole {
    SystemAdmin = "system_admin",
    Administrator = "administrator",
    Standard = "standard",
    Audit = "audit"
}

/**
 * Interface representing a user document in MongoDB.
 * @interface
 */
export interface UserDocument extends Document {
    isActive: boolean;
    role: UserRole;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    isPasswordChangeRequired: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export const UserSchema: Schema<UserDocument> = new Schema<UserDocument>({
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    role: {
        type: String,
        required: true,
        enum: Object.values(UserRole),
        default: UserRole.Standard
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value: string) => validator.isStrongPassword(value, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }),
            message: () => `The password must be at least 8 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.`
        }
    },
    isPasswordChangeRequired: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

UserSchema.pre<UserDocument>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>("User", UserSchema);