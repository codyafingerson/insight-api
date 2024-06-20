import { Router } from 'express';
import AuthController from "../controllers/AuthController";

const authRouter = Router();

// Route to get the current logged-in user's details
authRouter.get('/current-user', AuthController.getCurrentUser);

// Route to log out a user
authRouter.get('/logout', AuthController.logoutUser);

// Route to log in a user
authRouter.post('/login', AuthController.loginUser);

export default authRouter;