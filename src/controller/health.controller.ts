import { NextFunction, Request, Response } from 'express';

const ping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send('OK');
  } catch (e) {
    next(e);
  }
};

export default {
  ping,
};
