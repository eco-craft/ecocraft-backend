// src/controller/craft.controller.ts
import { NextFunction, Request, Response } from 'express';
import craftService from '../service/craft.service';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await craftService.createCraftIdea(req.body);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ambil kategori sebagai array (handle kategori tunggal atau lebih)
    const categories = req.query.categories ? (req.query.categories as string).split(',') : [];
    const title = req.query.title as string || '';

    // Panggil service untuk mendapatkan hasil berdasarkan kategori dan judul
    const result = await craftService.getAllCraftIdeas(categories, title);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};



const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await craftService.getCraftIdeaById(req.params.id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await craftService.updateCraftIdea(req.params.id, req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await craftService.deleteCraftIdea(req.params.id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};