import { z } from 'zod';

export const emailField = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const passwordField = z
  .string()
  .min(8, 'At least 8 characters')
  .max(128, 'At most 128 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number');

export const phoneField = z
  .string()
  .trim()
  .max(20, 'Phone number is too long')
  .regex(/^[+\d\s()-]*$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({ password: passwordField, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  phone: phoneField,
  bio: z.string().trim().max(1000, 'Bio is too long').optional(),
  city: z.string().trim().max(80).optional(),
  agency: z.string().trim().max(120).optional(),
  designation: z.string().trim().max(80).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((d) => d.newPassword !== d.currentPassword, { message: 'Choose a different password', path: ['newPassword'] });
