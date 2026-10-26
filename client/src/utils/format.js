const CURRENCY_LOCALE = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', AED: 'en-AE' };

/** Compact Indian-style price (₹1.45 Cr, ₹22,000) or a regular currency format for other currencies. */
export function formatPrice(price, currency = 'INR', { compact = true } = {}) {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return '';
  const value = Number(price);
  if (currency === 'INR' && compact) {
    if (value >= 1e7) return `₹${trimZeros((value / 1e7).toFixed(2))} Cr`;
    if (value >= 1e5) return `₹${trimZeros((value / 1e5).toFixed(2))} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] || 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: compact && value >= 1e6 ? 'compact' : 'standard',
  }).format(value);
}

const trimZeros = (s) => s.replace(/\.?0+$/, '');

/** Price with the right suffix: monthly rent is labelled "/month". */
export function formatListingPrice(property, options) {
  const base = formatPrice(property?.price, property?.currency, options);
  return property?.listingType === 'rent' ? `${base}/month` : base;
}

export function formatArea(area, unit = 'sqft') {
  if (!area) return '';
  return `${Number(area).toLocaleString('en-IN')} ${unit === 'sqm' ? 'sq m' : 'sq ft'}`;
}

export function formatDate(date, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', opts);
}

export function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secs] of units) {
    if (seconds >= secs) return rtf.format(-Math.floor(seconds / secs), unit);
  }
  return 'just now';
}

export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const cn = (...classes) => classes.flat().filter(Boolean).join(' ');

const ASSET_BASE = import.meta.env.VITE_ASSET_BASE_URL || '';

/** Resolves locally uploaded paths (/uploads/...) against the API origin when it differs. */
export function assetUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${ASSET_BASE}${url}`;
  return url;
}

/** Requests a smaller Unsplash rendition for cards and thumbnails. */
export function sizedImage(url, width) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return url.replace(/w=\d+/, `w=${width}`);
  if (url.includes('res.cloudinary.com')) return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  return assetUrl(url);
}
