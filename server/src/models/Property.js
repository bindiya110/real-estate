import mongoose from 'mongoose';

export const LISTING_TYPES = ['sale', 'rent'];
export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'townhouse', 'penthouse', 'studio', 'plot', 'commercial', 'office'];
export const PROPERTY_STATUSES = ['draft', 'pending', 'approved', 'rejected'];
export const FURNISHING = ['unfurnished', 'semi-furnished', 'furnished'];
export const AVAILABILITY = ['available', 'under-offer', 'sold', 'rented'];
export const AREA_UNITS = ['sqft', 'sqm'];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
export const AMENITIES = [
  'parking', 'swimming-pool', 'gym', 'garden', 'security', 'lift', 'power-backup', 'air-conditioning',
  'balcony', 'clubhouse', 'play-area', 'wifi', 'pet-friendly', 'fireplace', 'wardrobe', 'modular-kitchen',
];

const imageSchema = new mongoose.Schema(
  {
    upload: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
    url: { type: String, required: true, maxlength: 1000 },
    publicId: { type: String, maxlength: 300 },
    provider: { type: String, enum: ['cloudinary', 'local', 'external'], default: 'external' },
  },
  { _id: false },
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 140 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 },
    listingType: { type: String, enum: LISTING_TYPES, required: true },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, required: true, min: 0, max: 1e12 },
    currency: { type: String, enum: CURRENCIES, default: 'INR' },
    address: { type: String, trim: true, maxlength: 200, default: '' },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80, default: '' },
    country: { type: String, trim: true, maxlength: 80, default: 'India' },
    postalCode: { type: String, trim: true, maxlength: 12, default: '' },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    bedrooms: { type: Number, min: 0, max: 50, default: 0 },
    bathrooms: { type: Number, min: 0, max: 50, default: 0 },
    area: { type: Number, min: 0, max: 1e7, required: true },
    areaUnit: { type: String, enum: AREA_UNITS, default: 'sqft' },
    furnishing: { type: String, enum: FURNISHING, default: 'unfurnished' },
    amenities: [{ type: String, enum: AMENITIES }],
    parkingSpaces: { type: Number, min: 0, max: 50, default: 0 },
    yearBuilt: { type: Number, min: 1800, max: 2100 },
    images: { type: [imageSchema], validate: [(v) => v.length <= 15, 'A listing can have at most 15 images'] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: PROPERTY_STATUSES, default: 'pending' },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: '' },
    availabilityStatus: { type: String, enum: AVAILABILITY, default: 'available' },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

propertySchema.index({ slug: 1 }, { unique: true });
propertySchema.index({ status: 1, listingType: 1, publishedAt: -1 });
propertySchema.index({ status: 1, featured: 1, publishedAt: -1 });
propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ status: 1, city: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ category: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });
propertySchema.index({ agent: 1, status: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index(
  { title: 'text', description: 'text', city: 'text', address: 'text', state: 'text' },
  { weights: { title: 5, city: 4, address: 2, state: 2, description: 1 }, name: 'property_text' },
);

propertySchema.virtual('coverImage').get(function coverImage() {
  return this.images?.[0]?.url || '';
});

propertySchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

export default mongoose.model('Property', propertySchema);
