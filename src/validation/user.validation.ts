import { z } from 'zod';

export const RegisterUserValidation = z.object({
  name: z.string({
    required_error: 'Name is required',
  }),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Email is not valid'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password minimum 6 characters'),
  passwordConfirmation: z
    .string({
      required_error: 'Password confirmation is required',
    })
    .min(6, 'Password minimum 6 characters'),
});

export const LoginUserValidation = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Email is not valid'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password minimum 6 characters'),
});

export const GetCurrentUserValidation = z.object({
  userId: z.string(),
});

export const GetUserValidation = z.object({
  userId: z.string(),
});

export const DeleteUserValidation = z.object({
  userId: z.string(),
});

export const UpdateUserValidation = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email('Email is not valid').optional(),
  password: z.string().min(6, 'Password minimum 6 characters').optional(),
  passwordConfirmation: z
    .string()
    .min(6, 'Password minimum 6 characters')
    .optional(),
  currentPassword: z.string().optional(),
});

export const RefreshTokenValidation = z.object({
  refreshToken: z.string({
    required_error: 'Refresh token is required',
  }),
});
