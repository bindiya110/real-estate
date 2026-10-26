import { z } from 'zod';
import { emailField, phoneField } from './authSchemas';

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email: emailField,
  phone: phoneField,
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email: emailField,
  phone: phoneField,
  subject: z.string().trim().min(3, 'Subject is required').max(140),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export const newsletterSchema = z.object({ email: emailField });
