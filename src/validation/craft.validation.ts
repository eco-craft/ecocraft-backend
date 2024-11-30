// src/validation/craft.validation.ts
import { z } from 'zod';

export const CraftValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().url('Image must be a valid URL'),
  materials: z.array(z.string()).nonempty('At least one material is required'),
  steps: z.array(z.string()).nonempty('At least one step is required'),
  categories: z.array(z.string()).optional(),
});