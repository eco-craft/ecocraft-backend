import cors from 'cors';
import express from 'express';
import { errorMiddleware } from '../middleware/error.middleware';
import { userRouter } from '../route/api';
import { publicRouter } from '../route/public-api';



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
