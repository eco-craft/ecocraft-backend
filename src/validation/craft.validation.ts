import { z, ZodType } from 'zod';

export class CraftValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string({
      required_error: 'Title is required.',
    }),
    materials: z
      .array(z.string(), {
        required_error: 'Materials are required.',
      })
      .nonempty('At least one material is required.'),
    steps: z
      .array(z.string(), {
        required_error: 'Steps are required.',
      })
      .nonempty('At least one step is required.'),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string({
      required_error: 'ID is required.',
    }),
    title: z.string().optional(),
    materials: z
      .array(z.string())
      .nonempty('At least one material is required.')
      .optional(),
    steps: z
      .array(z.string())
      .nonempty('At least one step is required.')
      .optional()
  });

  static readonly IMAGE: ZodType = z.object({
    mimetype: z.string().regex(/^image\//, 'File must be an image.'),
    size: z
      .number()
      .max(20 * 1024 * 1024, 'Image size must be less than 20MB.'),
  });

  static readonly LIST: ZodType = z.object({
    title: z.string().optional(),
  });
}
