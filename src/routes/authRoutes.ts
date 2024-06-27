import { Router } from 'express';
import AuthController from "../controllers/AuthController";
import { authenticateUser, selfCheck } from '../middleware/authMiddleware';

const authRouter = Router();

// Route to get the current logged-in user's details
authRouter.get('/profile/:id', authenticateUser, selfCheck, AuthController.getCurrentUser);

// Route to log out a user
authRouter.get('/logout', AuthController.logoutUser);

// Route to log in a user
authRouter.post('/login', AuthController.loginUser);

authRouter.post('/request-password-reset', AuthController.requestPasswordReset);

authRouter.post('/reset-password', AuthController.resetPassword);

export default authRouter;