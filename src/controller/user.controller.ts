import { NextFunction, Request, Response } from 'express';
import userService from '../service/user.service';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.register(req.body);

    res.status(201).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.login(req.body, req.get('User-Agent'));

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const result = await userService.getCurrent({ userId });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;

    const result = await userService.get({ userId });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.list();

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    data.id = userId;

    const result = await userService.updateCurrent(data);

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await userService.logout(data);

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const result = await userService.removeCurrent({ userId });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNewAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const result = await userService.getNewAccessToken(data);

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getCurrent,
  get,
  list,
  updateCurrent,
  logout,
  removeCurrent,
  getNewAccessToken,
};
