import { z } from 'zod';
import {
  AMENITIES, AREA_UNITS, AVAILABILITY, CURRENCIES, FURNISHING, LISTING_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES,
} from '../models/Property.js';
import { objectId, pageQuery, searchText } from './common.js';

export const SORT_OPTIONS = {
  newest: { publishedAt: -1, _id: -1 },
  oldest: { publishedAt: 1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 },
  area_desc: { area: -1, _id: -1 },
};

const csvList = (allowed) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const list = (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean);
      return list.length ? list : undefined;
    })
    .refine((list) => !list || list.every((item) => allowed.includes(item)), 'Contains an unsupported value');

const optionalNumber = (max) => z.coerce.number().min(0).max(max).optional();
const location = z.string().trim().max(80).optional();

export const propertyQuerySchema = z
  .object({
    ...pageQuery,
    q: searchText,
    listingType: z.enum(LISTING_TYPES).optional(),
    propertyType: csvList(PROPERTY_TYPES),
    category: z.string().trim().max(80).optional(),
    city: location,
    state: location,
    country: location,
    location,
    minPrice: optionalNumber(1e12),
    maxPrice: optionalNumber(1e12),
    bedrooms: z.coerce.number().int().min(0).max(20).optional(),
    bathrooms: z.coerce.number().int().min(0).max(20).optional(),
    minArea: optionalNumber(1e7),
    maxArea: optionalNumber(1e7),
    furnishing: csvList(FURNISHING),
    amenities: csvList(AMENITIES),
    availabilityStatus: z.enum(AVAILABILITY).optional(),
    featured: z.enum(['true', 'false']).optional().transform((v) => (v === undefined ? undefined : v === 'true')),
    sort: z.enum(Object.keys(SORT_OPTIONS)).default('newest'),
  })
  .refine((d) => d.minPrice === undefined || d.maxPrice === undefined || d.minPrice <= d.maxPrice, {
    message: 'Minimum price cannot exceed maximum price',
    path: ['minPrice'],
  });

export const adminPropertyQuerySchema = z.object({
  ...pageQuery,
  q: searchText,
  status: z.enum(PROPERTY_STATUSES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
});

export const myPropertiesQuerySchema = z.object({
  ...pageQuery,
  status: z.enum(PROPERTY_STATUSES).optional(),
  q: searchText,
});

const propertyFields = {
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(140),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000),
  listingType: z.enum(LISTING_TYPES),
  propertyType: z.enum(PROPERTY_TYPES),
  category: objectId.optional().nullable(),
  price: z.coerce.number().positive('Price must be greater than zero').max(1e12),
  currency: z.enum(CURRENCIES).default('INR'),
  address: z.string().trim().max(200).default(''),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().max(80).default(''),
  country: z.string().trim().min(2).max(80).default('India'),
  postalCode: z.string().trim().max(12).regex(/^[A-Za-z0-9\s-]*$/, 'Invalid postal code').default(''),
  coordinates: z
    .object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    })
    .optional()
    .nullable(),
  bedrooms: z.coerce.number().int().min(0).max(50).default(0),
  bathrooms: z.coerce.number().int().min(0).max(50).default(0),
  area: z.coerce.number().positive('Area must be greater than zero').max(1e7),
  areaUnit: z.enum(AREA_UNITS).default('sqft'),
  furnishing: z.enum(FURNISHING).default('unfurnished'),
  amenities: z.array(z.enum(AMENITIES)).max(AMENITIES.length).default([]),
  parkingSpaces: z.coerce.number().int().min(0).max(50).default(0),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  availabilityStatus: z.enum(AVAILABILITY).default('available'),
  // Ordered list of Upload ids; the server resolves them to stored image records.
  images: z.array(objectId).max(15, 'A listing can have at most 15 images').default([]),
};

export const createPropertySchema = z.object({
  ...propertyFields,
  saveAsDraft: z.boolean().default(false),
});

export const updatePropertySchema = z
  .object(Object.fromEntries(Object.entries(propertyFields).map(([k, v]) => [k, v.optional()])))
  .extend({ saveAsDraft: z.boolean().optional() });

export const rejectPropertySchema = z.object({
  reason: z.string().trim().min(5, 'Please give a short reason').max(500),
});

export const featurePropertySchema = z.object({ featured: z.boolean() });

export const propertyStatusSchema = z.object({
  status: z.enum(PROPERTY_STATUSES).optional(),
  availabilityStatus: z.enum(AVAILABILITY).optional(),
});

export const slugParam = z.object({ slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/) });
