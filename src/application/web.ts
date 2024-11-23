import express from 'express';
import cors from 'cors';
import { publicRouter } from '../route/public-api';
import { userRouter } from '../route/api';
import { errorMiddleware } from '../middleware/error.middleware';

export const web = express();
web.use(express.json());

web.use(
  cors({
    credentials: true,
  })
);
web.use(publicRouter);
web.use(userRouter);

web.use(errorMiddleware);
