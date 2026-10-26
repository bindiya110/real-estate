import mongoose from 'mongoose';
import { z } from 'zod';

export const objectId = z.string().refine((v) => mongoose.isValidObjectId(v) && /^[a-f\d]{24}$/i.test(v), 'Invalid id');

export const idParam = z.object({ id: objectId });

export const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number');

export const phone = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+\d\s()-]*$/, 'Enter a valid phone number')
  .optional()
  .default('');

export const httpsUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => {
    if (v === '') return true;
    if (v.startsWith('/uploads/')) return true;
    try {
      const url = new URL(v);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Enter a valid URL');

export const pageQuery = {
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
};

export const searchText = z.string().trim().max(100).optional();
