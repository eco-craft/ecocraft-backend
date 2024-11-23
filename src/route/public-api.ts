import express from 'express';
import userController from '../controller/user.controller';
import healthController from '../controller/health.controller';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../docs/api-doc.json';

const publicRouter = express.Router();

publicRouter.post('/api/v1/users', userController.register);
publicRouter.post('/api/v1/users/login', userController.login);
publicRouter.post('/api/v1/users/token', userController.getNewAccessToken);
publicRouter.get('/api/v1/health', healthController.ping);
publicRouter.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { publicRouter };
