import express from 'express';
import { CraftController } from '../controller/craft.controller';
import { UserController } from '../controller/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';
import { PredictionController } from '../controller/prediction.controller';

const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage() 
});

// User API
apiRouter.get('/api/v1/users/current', UserController.getCurrent);
apiRouter.patch('/api/v1/users/current', upload.single('profilePicture'), UserController.updateCurrent);
apiRouter.delete('/api/v1/users/current', UserController.removeCurrent);
apiRouter.get('/api/v1/users', UserController.list);
apiRouter.get('/api/v1/users/:userId', UserController.get);
apiRouter.delete('/api/v1/users/logout', UserController.logout);

// Craft API
apiRouter.post('/api/v1/crafts', upload.single('craftImage'), CraftController.create);
apiRouter.get('/api/v1/crafts', CraftController.list);
apiRouter.get('/api/v1/crafts/:craftId', CraftController.get);
apiRouter.patch('/api/v1/crafts/:craftId', upload.single('craftImage'), CraftController.update);
apiRouter.delete('/api/v1/crafts/:craftId', CraftController.remove);
apiRouter.get('/api/v1/crafts-import', CraftController.createFromJSON);

// Prediction API
apiRouter.post('/api/v1/predictions', upload.single('materialImage'), PredictionController.predict);
apiRouter.get('/api/v1/predictions', PredictionController.list);
apiRouter.get('/api/v1/predictions/:predictionId', PredictionController.get);

export { apiRouter };

