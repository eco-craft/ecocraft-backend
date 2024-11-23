import { Request } from 'express';
import { CustomJWTPayload } from '../custom';

declare module 'express-serve-static-core' {
  interface Request {
    user?: CustomJWTPayload;
  }
}
