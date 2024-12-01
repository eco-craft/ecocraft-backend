import { Request } from 'express';
import { CustomJWTPayload } from '../custom';
import { UserJWTPayload } from '../../models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserJWTPayload;
  }
}
