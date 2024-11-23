import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../error/response-error';
import { verifyAccessToken } from '../utils/auth';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // Split between Bearer and the token
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) {
      throw new ResponseError(401, 'Unauthorized');
    }

    // Verify the access token
    const decoded = verifyAccessToken(accessToken);

    if (decoded == 'EXPIRED') {
      throw new ResponseError(401, 'Access token expired');
    } else if (decoded == 'INVALID') {
      throw new ResponseError(401, 'Invalid access token');
    }

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};