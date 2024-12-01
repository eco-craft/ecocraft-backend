import cors from 'cors';
import express from 'express';
import { errorMiddleware } from '../middleware/error.middleware';
import { apiRouter } from '../route/api';
import { publicRouter } from '../route/public-api';

export const web = express();
web.use(express.json());
web.use(
  cors({
    credentials: true,
  })
);
web.use(publicRouter);
web.use(apiRouter);
web.use(errorMiddleware);
