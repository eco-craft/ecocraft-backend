import { NextFunction, Request, Response } from 'express';
import { CraftService } from '../service/craft.service';
import {
  CraftResponse,
  CreateCraftFromJSONRequest,
  CreateCraftRequest,
  ListCraftRequest,
  UpdateCraftRequest,
} from '../models/craft.model';
import fs from 'fs';
import path from 'path';
import { ResponseError } from '../error/response-error';

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
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CraftService.get(req.params.craftId);

      res.status(200).json({
        data: result,
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

  static async createFromJSON(req: Request, res: Response, next: NextFunction) {
    try {
      // Define the path to the JSON file
      const filePath = './src/data/data-tutorial-1.json';

      // Read the JSON file
      const data = await fs.promises.readFile(filePath, 'utf8');

      try {
        // Parse the JSON data
        const crafts = JSON.parse(data) as CreateCraftFromJSONRequest[];

        // Initialize craftsResponse
        const craftsResponse: CraftResponse[] = [];

        // Use Promise.all to handle asynchronous operations
        const results = await Promise.all(
          crafts.map(async (craft) => {
            return await CraftService.createFromJson(req.user, craft);
          })
        );

        // Assign results to craftsResponse
        craftsResponse.push(...results);

        console.log('Success');
        res.status(200).json({
          data: craftsResponse,
        });
      } catch (parseErr) {
        console.error('Error parsing the JSON file:', parseErr);
        throw new ResponseError(500, 'Error');
      }
    } catch (error) {
      next(error);
    }
  }
}
