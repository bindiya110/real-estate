import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { buildMeta, getPagination } from '../utils/pagination.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };
  const [favorites, total] = await Promise.all([
    Favorite.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'property', match: { status: 'approved' } })
      .lean(),
    Favorite.countDocuments(filter),
  ]);
  const items = favorites.filter((f) => f.property).map((f) => ({ ...f.property, favoritedAt: f.createdAt }));
  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const ids = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).select('property').lean();
  sendSuccess(res, { data: favorites.map((f) => String(f.property)) });
});

export const add = asyncHandler(async (req, res) => {
  const { propertyId } = req.valid.params;
  const exists = await Property.exists({ _id: propertyId, status: 'approved' });
  if (!exists) throw ApiError.notFound('Property not found');
  await Favorite.updateOne(
    { user: req.user._id, property: propertyId },
    { $setOnInsert: { user: req.user._id, property: propertyId } },
    { upsert: true },
  );
  sendSuccess(res, { status: 201, message: 'Saved to favorites' });
});

export const remove = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, property: req.valid.params.propertyId });
  sendSuccess(res, { message: 'Removed from favorites' });
});
