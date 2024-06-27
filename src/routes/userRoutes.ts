import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { UserRole } from '../models/User';

const userRouter = Router();

userRouter.use(authenticateUser, authorizeRole([UserRole.Administrator]));

// Create a new user
userRouter.post('/', UserController.createNewUser);

// Get all users
userRouter.get('/', UserController.getAllUsers);

// Get a user by ID
userRouter.get('/:id', UserController.getUserById);

// Update a user
userRouter.put('/:id', UserController.updateUser);

// Search users
userRouter.get('/search', UserController.searchUsers);

// Delete a user
userRouter.delete('/:id', UserController.deleteUser);

// Send an email to a user
userRouter.post('/:id/send-email', UserController.sendEmail);

export default userRouter;