import { ZodError } from 'zod';
import { ResponseError } from '../error/response-error';
import { Request, Response, NextFunction } from 'express';
import { Validation } from '../validation/validation';

export const errorMiddleware = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    const errorDetails = Validation.formatZodErrors(error.errors);
    res
      .status(400)
      .json({
        error: {
          message: 'Validation failed.',
          details: errorDetails,
        },
      })
      .end();
  } else if (error instanceof ResponseError) {
    res
      .status(error.status)
      .json({
        error: {
          message: error.message,
          details: {},
        },
      })
      .end();
  } else {
    res
      .status(500)
      .json({
        error: {
          message: error.message,
          details: {},
        },
      })
      .end();
  }
};
