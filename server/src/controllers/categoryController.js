import Category from '../models/Category.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { uniqueSlug } from '../utils/slugify.js';

async function withCounts(categories) {
  const counts = await Property.aggregate([
    { $match: { status: 'approved', category: { $in: categories.map((c) => c._id) } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  return categories.map((c) => ({ ...c, propertyCount: map.get(String(c._id)) || 0 }));
}

export const listPublic = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  sendSuccess(res, { data: await withCounts(categories) });
});

export const listAll = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  sendSuccess(res, { data: await withCounts(categories) });
});

export const create = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, slug: await uniqueSlug(Category, req.body.name) });
  sendSuccess(res, { status: 201, data: category, message: 'Category created' });
});

export const update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.valid.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (req.body.name && req.body.name !== category.name) category.slug = await uniqueSlug(Category, req.body.name, category._id);
  Object.assign(category, req.body);
  await category.save();
  sendSuccess(res, { data: category, message: 'Category updated' });
});

export const remove = asyncHandler(async (req, res) => {
  const inUse = await Property.exists({ category: req.valid.params.id });
  if (inUse) throw ApiError.conflict('This category is used by existing listings. Deactivate it instead.');
  const deleted = await Category.findByIdAndDelete(req.valid.params.id);
  if (!deleted) throw ApiError.notFound('Category not found');
  sendSuccess(res, { message: 'Category deleted' });
});
