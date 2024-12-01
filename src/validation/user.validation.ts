import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string({
      required_error: 'Name is required.',
    }),
    email: z
      .string({
        required_error: 'Email is required.',
      })
      .email('Email is not valid.'),
    password: z
      .string({
        required_error: 'Password is required.',
      })
      .min(6, 'Password minimum 6 characters.'),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z
      .string({
        required_error: 'Email is required.',
      })
      .email('Email is not valid.'),
    password: z
      .string({
        required_error: 'Password is required.',
      })
      .min(6, 'Password minimum 6 characters.'),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().optional(),
    email: z.string().email('Email is not valid.').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(6, 'Password minimum 6 characters.').optional(),
    passwordConfirmation: z
      .string()
      .min(6, 'Password minimum 6 characters.')
      .optional(),
  });

  static readonly IMAGE: ZodType = z.object({
    mimetype: z.string().regex(/^image\//, 'File must be an image.'),
    size: z
      .number()
      .max(20 * 1024 * 1024, 'Image size must be less than 20MB.'),
  });

  static readonly LOGOUT: ZodType = z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required.',
    }),
  });

  static readonly GET_NEW_ACCESS_TOKEN: ZodType = z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required.',
    }),
  });
}
