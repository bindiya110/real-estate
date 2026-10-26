export const SITE_NAME = 'EstateHub';

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
];

export const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

export const FURNISHING = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-furnished' },
  { value: 'furnished', label: 'Fully furnished' },
];

export const AVAILABILITY = [
  { value: 'available', label: 'Available' },
  { value: 'under-offer', label: 'Under offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
];

export const AMENITIES = [
  { value: 'parking', label: 'Parking' },
  { value: 'swimming-pool', label: 'Swimming pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'garden', label: 'Garden' },
  { value: 'security', label: '24/7 Security' },
  { value: 'lift', label: 'Lift' },
  { value: 'power-backup', label: 'Power backup' },
  { value: 'air-conditioning', label: 'Air conditioning' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'clubhouse', label: 'Clubhouse' },
  { value: 'play-area', label: 'Kids play area' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'pet-friendly', label: 'Pet friendly' },
  { value: 'fireplace', label: 'Fireplace' },
  { value: 'wardrobe', label: 'Wardrobes' },
  { value: 'modular-kitchen', label: 'Modular kitchen' },
];

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
export const AREA_UNITS = [
  { value: 'sqft', label: 'sq ft' },
  { value: 'sqm', label: 'sq m' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export const SALE_PRICE_PRESETS = [
  { value: 2500000, label: '₹25 L' },
  { value: 5000000, label: '₹50 L' },
  { value: 10000000, label: '₹1 Cr' },
  { value: 20000000, label: '₹2 Cr' },
  { value: 50000000, label: '₹5 Cr' },
  { value: 100000000, label: '₹10 Cr' },
];

export const RENT_PRICE_PRESETS = [
  { value: 15000, label: '₹15k' },
  { value: 30000, label: '₹30k' },
  { value: 50000, label: '₹50k' },
  { value: 100000, label: '₹1 L' },
  { value: 250000, label: '₹2.5 L' },
  { value: 500000, label: '₹5 L' },
];

export const PROPERTY_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const INQUIRY_STATUS = {
  new: { label: 'New', tone: 'info' },
  read: { label: 'Read', tone: 'neutral' },
  replied: { label: 'Replied', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

export const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Admin' },
];

export const MAX_IMAGES = 15;
export const MAX_IMAGE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value;
