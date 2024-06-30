import { UserRole } from "../models/User";

/**
 * Interface representing a user response object.
 */
export default interface UserResponse {
    id: string;
    isActive: boolean;
    role: UserRole;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}