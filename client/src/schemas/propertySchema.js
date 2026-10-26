import { z } from 'zod';

const optionalNumber = (schema) =>
  z.preprocess((v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)), schema.optional());

const requiredNumber = (message, schema) =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), schema ?? z.number({ required_error: message, invalid_type_error: message }));

/** Each step validates only its own fields so users get feedback before moving on. */
export const stepSchemas = [
  z.object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(140),
    description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000),
    listingType: z.enum(['sale', 'rent'], { errorMap: () => ({ message: 'Choose sale or rent' }) }),
    propertyType: z.string().min(1, 'Choose a property type'),
    category: z.string().optional(),
  }),
  z.object({
    price: requiredNumber('Enter a price', z.number({ invalid_type_error: 'Enter a price' }).positive('Price must be greater than zero')),
    currency: z.string().min(3),
    country: z.string().trim().min(2, 'Country is required').max(80),
    state: z.string().trim().max(80).optional(),
    city: z.string().trim().min(2, 'City is required').max(80),
    address: z.string().trim().max(200).optional(),
    postalCode: z.string().trim().max(12).regex(/^[A-Za-z0-9\s-]*$/, 'Invalid postal code').optional(),
    lat: optionalNumber(z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude')),
    lng: optionalNumber(z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude')),
  }),
  z.object({
    bedrooms: requiredNumber('Required', z.number().int().min(0).max(50)),
    bathrooms: requiredNumber('Required', z.number().int().min(0).max(50)),
    area: requiredNumber('Enter the area', z.number({ invalid_type_error: 'Enter the area' }).positive('Area must be greater than zero')),
    areaUnit: z.enum(['sqft', 'sqm']),
    furnishing: z.enum(['unfurnished', 'semi-furnished', 'furnished']),
    parkingSpaces: optionalNumber(z.number().int().min(0).max(50)),
    yearBuilt: optionalNumber(z.number().int().min(1800, 'Enter a valid year').max(2100, 'Enter a valid year')),
    availabilityStatus: z.string(),
    amenities: z.array(z.string()),
  }),
  z.object({
    images: z.array(z.object({ _id: z.string(), url: z.string() })).max(15, 'At most 15 images'),
  }),
];

export const STEP_FIELDS = stepSchemas.map((s) => Object.keys(s.shape));

export const fullPropertySchema = stepSchemas.reduce((acc, schema) => acc.merge(schema));

export const emptyProperty = {
  title: '',
  description: '',
  listingType: 'sale',
  propertyType: '',
  category: '',
  price: '',
  currency: 'INR',
  country: 'India',
  state: '',
  city: '',
  address: '',
  postalCode: '',
  lat: '',
  lng: '',
  bedrooms: 2,
  bathrooms: 2,
  area: '',
  areaUnit: 'sqft',
  furnishing: 'unfurnished',
  parkingSpaces: 0,
  yearBuilt: '',
  availabilityStatus: 'available',
  amenities: [],
  images: [],
};

/** Converts an API property into form values. */
export function propertyToForm(p) {
  return {
    ...emptyProperty,
    title: p.title ?? '',
    description: p.description ?? '',
    listingType: p.listingType ?? 'sale',
    propertyType: p.propertyType ?? '',
    category: p.category?._id ?? p.category ?? '',
    price: p.price ?? '',
    currency: p.currency ?? 'INR',
    country: p.country ?? 'India',
    state: p.state ?? '',
    city: p.city ?? '',
    address: p.address ?? '',
    postalCode: p.postalCode ?? '',
    lat: p.coordinates?.lat ?? '',
    lng: p.coordinates?.lng ?? '',
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    area: p.area ?? '',
    areaUnit: p.areaUnit ?? 'sqft',
    furnishing: p.furnishing ?? 'unfurnished',
    parkingSpaces: p.parkingSpaces ?? 0,
    yearBuilt: p.yearBuilt ?? '',
    availabilityStatus: p.availabilityStatus ?? 'available',
    amenities: p.amenities ?? [],
    images: (p.images ?? []).filter((i) => i.upload).map((i) => ({ _id: i.upload, url: i.url })),
  };
}

/** Converts validated form values into the API payload. */
export function formToPayload(values) {
  const hasCoords = values.lat !== undefined && values.lng !== undefined && values.lat !== '' && values.lng !== '';
  return {
    title: values.title,
    description: values.description,
    listingType: values.listingType,
    propertyType: values.propertyType,
    category: values.category || null,
    price: Number(values.price),
    currency: values.currency,
    country: values.country,
    state: values.state || '',
    city: values.city,
    address: values.address || '',
    postalCode: values.postalCode || '',
    coordinates: hasCoords ? { lat: Number(values.lat), lng: Number(values.lng) } : null,
    bedrooms: Number(values.bedrooms) || 0,
    bathrooms: Number(values.bathrooms) || 0,
    area: Number(values.area),
    areaUnit: values.areaUnit,
    furnishing: values.furnishing,
    parkingSpaces: Number(values.parkingSpaces) || 0,
    yearBuilt: values.yearBuilt ? Number(values.yearBuilt) : null,
    availabilityStatus: values.availabilityStatus,
    amenities: values.amenities,
    images: values.images.map((i) => i._id),
  };
}
