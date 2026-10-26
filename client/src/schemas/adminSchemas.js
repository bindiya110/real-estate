import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/uploads/'), 'Enter a valid URL starting with https://');

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60),
  description: z.string().trim().max(300).optional(),
  image: urlOrEmpty.optional(),
  isActive: z.boolean(),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  role: z.string().trim().max(80).optional(),
  content: z.string().trim().min(10, 'At least 10 characters').max(1000),
  avatar: urlOrEmpty.optional(),
  rating: z.coerce.number().int().min(1).max(5),
  isPublished: z.boolean(),
});

export const rejectSchema = z.object({
  reason: z.string().trim().min(5, 'Please give a short reason (at least 5 characters)').max(500),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(140).optional(),
  heroTitle: z.string().trim().max(120).optional(),
  heroSubtitle: z.string().trim().max(300).optional(),
  heroImage: urlOrEmpty.optional(),
  contactEmail: z.string().trim().email('Enter a valid email'),
  contactPhone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  socialLinks: z.object({
    facebook: urlOrEmpty.optional(),
    instagram: urlOrEmpty.optional(),
    linkedin: urlOrEmpty.optional(),
    twitter: urlOrEmpty.optional(),
  }),
});
