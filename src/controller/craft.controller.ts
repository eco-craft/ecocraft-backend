import { NextFunction, Request, Response } from 'express';
import { CraftService } from '../service/craft.service';
import {
  CreateCraftRequest,
  ListCraftRequest,
  UpdateCraftRequest,
} from '../models/craft.model';

export class CraftController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as CreateCraftRequest;
      const result = await CraftService.create(req.user, request, req.file);

      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const request: ListCraftRequest = {
        title: req.query.title as string,
      };

      const result = await CraftService.list(request);
      res.status(200).json({ 
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CraftService.get(req.params.craftId);
      
      res.status(200).json({ 
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as UpdateCraftRequest;
      request.id = req.params.craftId;
      const result = await CraftService.update(req.user, request, req.file);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CraftService.remove(req.user, req.params.craftId);
      
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
