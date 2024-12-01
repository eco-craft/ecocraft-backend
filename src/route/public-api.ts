import express from 'express';
import { UserController } from '../controller/user.controller';
import { HealthController } from '../controller/health.controller';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../docs/api-doc.json';

const publicRouter = express.Router();

publicRouter.post('/api/v1/users', UserController.register);
publicRouter.post('/api/v1/users/login', UserController.login);
publicRouter.post('/api/v1/users/token', UserController.getNewAccessToken);
publicRouter.get('/api/v1/health', HealthController.ping);
publicRouter.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { publicRouter };
