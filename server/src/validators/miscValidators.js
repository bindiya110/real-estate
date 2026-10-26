import { z } from 'zod';
import { INQUIRY_STATUSES } from '../models/Inquiry.js';
import { CONTACT_STATUSES } from '../models/ContactMessage.js';
import { ROLES } from '../models/User.js';
import { email, httpsUrl, objectId, pageQuery, phone, searchText } from './common.js';

export const createInquirySchema = z
  .object({
    propertyId: objectId.optional(),
    agentId: objectId.optional(),
    name: z.string().trim().min(2, 'Name is required').max(80),
    email,
    phone,
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  })
  .refine((d) => d.propertyId || d.agentId, { message: 'A property or agent is required', path: ['propertyId'] });

export const inquiryStatusSchema = z.object({ status: z.enum(INQUIRY_STATUSES) });

export const inquiryQuerySchema = z.object({
  ...pageQuery,
  box: z.enum(['received', 'sent']).default('received'),
  status: z.enum(INQUIRY_STATUSES).optional(),
});

export const adminInquiryQuerySchema = z.object({
  ...pageQuery,
  status: z.enum(INQUIRY_STATUSES).optional(),
  q: searchText,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  email,
  phone,
  subject: z.string().trim().min(3, 'Subject is required').max(140),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export const contactStatusSchema = z.object({ status: z.enum(CONTACT_STATUSES) });

export const newsletterSchema = z.object({ email });

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).default(''),
  image: httpsUrl.default(''),
  isActive: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().max(80).default(''),
  content: z.string().trim().min(10).max(1000),
  avatar: httpsUrl.default(''),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isPublished: z.boolean().default(true),
});

export const agentQuerySchema = z.object({
  ...pageQuery,
  q: searchText,
  city: z.string().trim().max(80).optional(),
});

export const adminUserQuerySchema = z.object({
  ...pageQuery,
  q: searchText,
  role: z.enum(ROLES).optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export const roleSchema = z.object({ role: z.enum(ROLES) });
export const userStatusSchema = z.object({ isActive: z.boolean() });

export const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(60).optional(),
  tagline: z.string().trim().max(140).optional(),
  heroTitle: z.string().trim().max(120).optional(),
  heroSubtitle: z.string().trim().max(300).optional(),
  heroImage: httpsUrl.optional(),
  contactEmail: email.optional(),
  contactPhone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  socialLinks: z
    .object({
      facebook: httpsUrl.optional(),
      instagram: httpsUrl.optional(),
      linkedin: httpsUrl.optional(),
      twitter: httpsUrl.optional(),
    })
    .optional(),
});

export const deleteUploadsSchema = z.object({
  uploadIds: z.array(objectId).min(1).max(15),
});

export const listQuerySchema = z.object({ ...pageQuery, q: searchText });
