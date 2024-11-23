import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import userController from '../controller/user.controller';

const userRouter = express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.get('/api/v1/users/current', userController.getCurrent);
userRouter.patch('/api/v1/users/current', userController.updateCurrent);
userRouter.delete('/api/v1/users/current', userController.removeCurrent);
userRouter.get('/api/v1/users', userController.list);
userRouter.get('/api/v1/users/:userId', userController.get);
userRouter.delete('/api/v1/users/logout', userController.logout);

export { userRouter };
