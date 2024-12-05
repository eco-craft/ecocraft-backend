import { z, ZodType } from 'zod';

export class PredictionValidation {
  static readonly IMAGE: ZodType = z.object({
    mimetype: z.string().regex(/^image\//, 'File must be an image.'),
    size: z
      .number()
      .max(20 * 1024 * 1024, 'Image size must be less than 20MB.'),
  });
}
