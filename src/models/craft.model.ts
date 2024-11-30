// src/models/craft.model.ts
import { db } from '../application/database';

export interface Craft {
  id: string;
  title: string;
  image: string;
  materials: string[];
  steps: string[];
  categories: string[]; // New property for categories
  createdAt: string;
  updatedAt: string;
}

export const craftsRef = db.collection('crafts');