import mongoose from 'mongoose';
import Property from '../models/Property.js';
import Category from '../models/Category.js';
import Upload from '../models/Upload.js';
import Favorite from '../models/Favorite.js';
import Inquiry from '../models/Inquiry.js';
import ApiError from '../utils/ApiError.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slugify.js';
import { escapeRegex } from '../utils/tokens.js';
import { SORT_OPTIONS } from '../validators/propertyValidators.js';
import { deleteStoredUploads } from './uploadService.js';

export const PUBLIC_PERSON_FIELDS = 'name avatar role phone email agency designation city';
const CARD_FIELDS =
  'title slug listingType propertyType price currency city state country address bedrooms bathrooms area areaUnit images featured furnishing availabilityStatus publishedAt createdAt status';

const exactText = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

async function resolveCategoryId(value) {
  if (!value) return undefined;
  if (mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value)) return value;
  const category = await Category.findOne({ slug: value.toLowerCase() }).select('_id').lean();
  return category?._id ?? null;
}

/** Builds a safe MongoDB filter from validated query parameters. Only approved listings are public. */
export async function buildPublicFilter(query) {
  const filter = { status: 'approved' };

  if (query.listingType) filter.listingType = query.listingType;
  if (query.propertyType) filter.propertyType = { $in: query.propertyType };
  if (query.furnishing) filter.furnishing = { $in: query.furnishing };
  if (query.amenities) filter.amenities = { $all: query.amenities };
  if (query.availabilityStatus) filter.availabilityStatus = query.availabilityStatus;
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.city) filter.city = exactText(query.city);
  if (query.state) filter.state = exactText(query.state);
  if (query.country) filter.country = exactText(query.country);
  if (query.location) {
    const rx = new RegExp(escapeRegex(query.location), 'i');
    filter.$or = [{ city: rx }, { state: rx }, { address: rx }];
  }
  if (query.bedrooms !== undefined) filter.bedrooms = { $gte: query.bedrooms };
  if (query.bathrooms !== undefined) filter.bathrooms = { $gte: query.bathrooms };

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.minArea !== undefined || query.maxArea !== undefined) {
    filter.area = {};
    if (query.minArea !== undefined) filter.area.$gte = query.minArea;
    if (query.maxArea !== undefined) filter.area.$lte = query.maxArea;
  }
  if (query.category) {
    const categoryId = await resolveCategoryId(query.category);
    filter.category = categoryId ?? new mongoose.Types.ObjectId(); // unknown category → no results
  }
  if (query.q) filter.$text = { $search: query.q };

  return filter;
}

export async function searchProperties(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = await buildPublicFilter(query);
  const sort = SORT_OPTIONS[query.sort] || SORT_OPTIONS.newest;

  const [items, total] = await Promise.all([
    Property.find(filter)
      .select(CARD_FIELDS)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export function listPublic({ featured, limit = 8, listingType } = {}) {
  const filter = { status: 'approved' };
  if (featured) filter.featured = true;
  if (listingType) filter.listingType = listingType;
  return Property.find(filter).select(CARD_FIELDS).sort({ publishedAt: -1 }).limit(limit).lean();
}

export function popularLocations(limit = 8) {
  return Property.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: { city: '$city', state: '$state' },
        count: { $sum: 1 },
        image: { $first: { $arrayElemAt: ['$images.url', 0] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, city: '$_id.city', state: '$_id.state', count: 1, image: 1 } },
  ]);
}

const detailPopulate = [
  { path: 'category', select: 'name slug' },
  { path: 'owner', select: PUBLIC_PERSON_FIELDS },
  { path: 'agent', select: PUBLIC_PERSON_FIELDS },
];

export const canManage = (user, property) =>
  Boolean(user) && (user.role === 'admin' || String(property.owner?._id ?? property.owner) === String(user._id));

/** Public visitors only see approved listings; owners and admins can view their own non-public ones. */
export async function getVisibleProperty(filter, user) {
  const property = await Property.findOne(filter).populate(detailPopulate).lean();
  if (!property) throw ApiError.notFound('Property not found');
  if (property.status !== 'approved' && !canManage(user, property)) throw ApiError.notFound('Property not found');

  if (property.status === 'approved') {
    await Property.updateOne({ _id: property._id }, { $inc: { views: 1 } });
  }
  if (!canManage(user, property)) delete property.rejectionReason;
  return property;
}

export function similarProperties(property, limit = 4) {
  return Property.find({
    _id: { $ne: property._id },
    status: 'approved',
    listingType: property.listingType,
    $or: [{ city: property.city }, { propertyType: property.propertyType }],
  })
    .select(CARD_FIELDS)
    .sort({ featured: -1, publishedAt: -1 })
    .limit(limit)
    .lean();
}

/** Turns a list of Upload ids into embedded image records, verifying that the owner uploaded each one. */
async function resolveImages(imageIds, ownerId, actor) {
  if (!imageIds?.length) return [];
  const uploads = await Upload.find({ _id: { $in: imageIds }, kind: 'property' }).lean();
  const byId = new Map(uploads.map((u) => [String(u._id), u]));

  return imageIds.map((id) => {
    const upload = byId.get(String(id));
    if (!upload) throw ApiError.badRequest('One or more images could not be found. Please re-upload them.');
    const allowed = [String(ownerId), String(actor._id)].includes(String(upload.uploadedBy)) || actor.role === 'admin';
    if (!allowed) throw ApiError.forbidden('You can only use images you uploaded');
    return { upload: upload._id, url: upload.url, publicId: upload.publicId, provider: upload.provider };
  });
}

async function validateCategory(categoryId) {
  if (!categoryId) return;
  const exists = await Category.exists({ _id: categoryId, isActive: true });
  if (!exists) throw ApiError.badRequest('Selected category does not exist', [{ field: 'category', message: 'Invalid category' }]);
}

export async function createProperty(data, user) {
  const { saveAsDraft, images: imageIds, ...fields } = data;

  if (!saveAsDraft && !user.isEmailVerified && user.role !== 'admin') {
    throw ApiError.forbidden('Please verify your email address before submitting a listing for approval. You can save it as a draft.');
  }
  await validateCategory(fields.category);

  const images = await resolveImages(imageIds, user._id, user);
  if (!saveAsDraft && images.length === 0) throw ApiError.badRequest('Add at least one image before submitting');

  let status = saveAsDraft ? 'draft' : 'pending';
  if (!saveAsDraft && user.role === 'admin') status = 'approved';

  const property = await Property.create({
    ...fields,
    category: fields.category || undefined,
    coordinates: fields.coordinates || undefined,
    yearBuilt: fields.yearBuilt || undefined,
    images,
    slug: await uniqueSlug(Property, `${fields.title} ${fields.city}`),
    owner: user._id,
    agent: user.role === 'agent' ? user._id : undefined,
    status,
    publishedAt: status === 'approved' ? new Date() : undefined,
  });

  await Upload.updateMany({ _id: { $in: images.map((i) => i.upload) } }, { property: property._id });
  return property;
}

export async function updateProperty(propertyId, data, user, { asAdmin = false } = {}) {
  const property = await Property.findById(propertyId);
  if (!property) throw ApiError.notFound('Property not found');
  if (!canManage(user, property)) throw ApiError.forbidden('You can only edit your own listings');

  const { saveAsDraft, images: imageIds, ...fields } = data;
  if ('category' in fields) await validateCategory(fields.category);

  const previousUploadIds = property.images.map((i) => String(i.upload)).filter(Boolean);
  if (imageIds) property.images = await resolveImages(imageIds, property.owner, user);

  const titleChanged = fields.title && fields.title !== property.title;
  Object.assign(property, fields);
  if ('category' in fields && !fields.category) property.category = undefined;
  if (titleChanged) property.slug = await uniqueSlug(Property, `${fields.title} ${property.city}`, property._id);

  if (!asAdmin) {
    // Any owner edit sends the listing back for review so admins see what goes live.
    if (saveAsDraft) property.status = 'draft';
    else if (user.role === 'admin') property.status = 'approved';
    else {
      if (!user.isEmailVerified) throw ApiError.forbidden('Please verify your email address before submitting a listing for approval.');
      if (property.images.length === 0) throw ApiError.badRequest('Add at least one image before submitting');
      property.status = 'pending';
      property.rejectionReason = '';
    }
  }
  if (property.status === 'approved' && !property.publishedAt) property.publishedAt = new Date();

  await property.save();

  if (imageIds) {
    const currentIds = property.images.map((i) => String(i.upload)).filter(Boolean);
    const removed = previousUploadIds.filter((id) => !currentIds.includes(id));
    await Upload.updateMany({ _id: { $in: currentIds } }, { property: property._id });
    if (removed.length) await deleteStoredUploads(await Upload.find({ _id: { $in: removed } }));
  }
  return property;
}

export async function deleteProperty(propertyId, user) {
  const property = await Property.findById(propertyId);
  if (!property) throw ApiError.notFound('Property not found');
  if (!canManage(user, property)) throw ApiError.forbidden('You can only delete your own listings');

  await Promise.all([
    Favorite.deleteMany({ property: property._id }),
    Inquiry.updateMany({ property: property._id }, { $unset: { property: 1 } }),
  ]);
  const uploads = await Upload.find({ property: property._id });
  await deleteStoredUploads(uploads);
  await property.deleteOne();
}

export async function ownerStats(userId) {
  const owner = new mongoose.Types.ObjectId(String(userId));
  const [byStatus, inquiriesReceived, favorites] = await Promise.all([
    Property.aggregate([{ $match: { owner } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Inquiry.countDocuments({ recipient: owner }),
    Favorite.countDocuments({ user: owner }),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  return {
    total: byStatus.reduce((sum, s) => sum + s.count, 0),
    approved: counts.approved || 0,
    pending: counts.pending || 0,
    rejected: counts.rejected || 0,
    draft: counts.draft || 0,
    inquiriesReceived,
    favorites,
  };
}
