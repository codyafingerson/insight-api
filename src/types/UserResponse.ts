import { UserRole } from "../models/User";

export default interface UserResponse {
    id: string;
    isActive: boolean;
    role: UserRole;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}