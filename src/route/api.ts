import express from 'express';
import craftController from '../controller/craft.controller';
import userController from '../controller/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const userRouter = express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.get('/api/v1/users/current', userController.getCurrent);
userRouter.patch('/api/v1/users/current', userController.updateCurrent);
userRouter.delete('/api/v1/users/current', userController.removeCurrent);
userRouter.get('/api/v1/users', userController.list);
userRouter.get('/api/v1/users/:userId', userController.get);
userRouter.delete('/api/v1/users/logout', userController.logout);

// Craft API
userRouter.post('/api/v1/crafts', craftController.create); // Create a new craft idea
userRouter.get('/api/v1/crafts', craftController.getAll); // Get all craft ideas
userRouter.get('/api/v1/crafts/:id', craftController.getById); // Get a craft idea by ID
userRouter.patch('/api/v1/crafts/:id', craftController.update); // Update a craft idea by ID
userRouter.delete('/api/v1/crafts/:id', craftController.remove); // Delete a craft idea by ID


export { userRouter };

