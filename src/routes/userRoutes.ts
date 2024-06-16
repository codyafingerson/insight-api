import { Router } from 'express';
import { protect, admin } from "../middleware/authMiddleware";
import UserController from '../controllers/UserController';

const userRouter = Router();

userRouter.get('/all', protect, admin, UserController.getAllUsers);

userRouter.post('/create', protect, admin, UserController.createNewUser);

userRouter.get('/:id', protect, admin, UserController.getUserById);

userRouter.put('/update/:id', protect, admin, UserController.updateUser);

userRouter.get('/search', protect, admin, UserController.searchUsers);

userRouter.delete('/delete/:id', protect, admin, UserController.deleteUser);

userRouter.post('/request-password-reset', UserController.requestPasswordReset);

userRouter.post('/reset-password', UserController.resetPassword);

userRouter.post('/send-email/:id', protect, admin, UserController.sendEmail);

export default userRouter;