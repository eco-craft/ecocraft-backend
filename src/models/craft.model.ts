import { db } from '../application/database';
import { timeFormatter } from '../utils/time';
import { UserResponse } from './user.model';

// Database document schema
export type Craft = {
  id: string;
  title: string;
  image: string;
  materials: string[];
  steps: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// API response
export type CraftResponse = {
  id: string;
  title: string;
  image: string;
  materials: string[];
  steps: string[];
  user: {
    id: string;
    name: string;
    photo: string;
  };
  createdAt: string;
};

// Request schema
export type CreateCraftRequest = {
  title: string;
  materials: string[];
  steps: string[];
};

export type UpdateCraftRequest = {
  id: string;
  title?: string;
  materials?: string[];
  steps?: string[];
};

export type ListCraftRequest = {
  title?: string;
};

// Response function
export function toCraftResponse(craft: Craft, user: UserResponse): CraftResponse {
  const formattedDate = timeFormatter.format(new Date(craft.createdAt));

  return {
    id: craft.id,
    title: craft.title,
    image: craft.image,
    materials: craft.materials,
    steps: craft.steps,
    user: {
      id: user.id,
      name: user.name,
      photo: user.photo,
    },
    createdAt: formattedDate
  };
}

export const craftsRef = db.collection('crafts');
