import { z } from 'zod';
import { email, password, phone } from './common.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password,
  phone,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().trim().length(64, 'Invalid reset token'),
  password,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().length(64, 'Invalid verification token'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone,
  bio: z.string().trim().max(1000).optional(),
  avatar: z.string().trim().max(1000).optional(),
  agency: z.string().trim().max(120).optional(),
  designation: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: password,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });
