import { NextFunction, Request, Response } from 'express';
import { UserService } from '../service/user.service';
import {
  RegisterUserRequest,
  LoginUserRequest,
  UserJWTPayload,
  UpdateUserRequest,
  GetNewAccessTokenRequest,
  LogoutUserRequest,
} from '../models/user.model';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as RegisterUserRequest;
      const result = await UserService.register(request);

      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as LoginUserRequest;
      const result = await UserService.login(request, req.get('User-Agent'));

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserJWTPayload;
      const result = await UserService.getCurrent(user);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const result = await UserService.get(userId);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.list();

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as UpdateUserRequest;
      const result = await UserService.updateCurrent(req.user, request, req.file);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as LogoutUserRequest;
      const result = await UserService.logout(request);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.removeCurrent(req.user);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNewAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request = req.body as GetNewAccessTokenRequest;
      const result = await UserService.getNewAccessToken(request);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
