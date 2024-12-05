import { NextFunction, Request, Response } from 'express';
import { PredictionService } from '../service/prediction.service';

export class PredictionController {
  static async predict(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PredictionService.predict(req.user, req.file);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PredictionService.list(req.user);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PredictionService.get(
        req.user,
        req.params.predictionId
      );

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
