import { ResponseError } from '../error/response-error';
import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res
      .status(err.status)
      .json({
        error: {
          message: err.message,
          details: err.details,
        },
      })
      .end();
      
  } else {
    res
      .status(500)
      .json({
        error: {
          message: err.message,
          details: err.details,
        },
      })
      .end();
  }
  
};
