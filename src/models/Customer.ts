import mongoose, { Document, Schema } from "mongoose";

/**
 * @interface CustomerDocument - Represents a customer document stored in the database
 */
export interface CustomerDocument extends Document {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    companyName?: string;
    companyAddress?: string;
    companyPhoneNumber?: string;
    gender?: 'Male' | 'Female' | 'Other';
    dateOfBirth?: Date;
    preferredLanguage?: string;
    isEmailAllowed?: boolean;
    notes?: string[];
}

export const CustomerSchema: Schema<CustomerDocument> = new Schema<CustomerDocument>({
    // Basic Information
    isActive: {
        type: Boolean,
        default: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    // Company Information
    companyName: {
        type: String
    },
    companyAddress: {
        type: String
    },
    companyPhoneNumber: {
        type: String
    },

    // Demographics
    gender: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },

    // Preferences
    preferredLanguage: {
        type: String
    },
    isEmailAllowed: {
        type: Boolean,
        default: true
    },
    notes: {
        type: [String]
    }
}, { timestamps: true });

export default mongoose.model<CustomerDocument>("Customer", CustomerSchema);