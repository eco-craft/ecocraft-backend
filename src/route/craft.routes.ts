// src/route/craft.routes.ts
import express from 'express';
import craftController from '../controller/craft.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const craftRouter = express.Router();

// Public routes for managing craft ideas
craftRouter.post('/api/v1/crafts', authMiddleware, craftController.create); // Create a new craft idea
craftRouter.get('/api/v1/crafts', craftController.getAll); // Get all craft ideas
craftRouter.get('/api/v1/crafts/:id', craftController.getById); // Get a craft idea by ID
craftRouter.patch('/api/v1/crafts/:id', authMiddleware, craftController.update); // Update a craft idea by ID
craftRouter.delete('/api/v1/crafts/:id', authMiddleware, craftController.remove); // Delete a craft idea by ID



export { craftRouter };
