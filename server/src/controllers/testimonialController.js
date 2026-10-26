import Testimonial from '../models/Testimonial.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listPublic = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 }).limit(12).lean();
  sendSuccess(res, { data: items });
});

export const listAll = asyncHandler(async (_req, res) => {
  sendSuccess(res, { data: await Testimonial.find().sort({ createdAt: -1 }).lean() });
});

export const create = asyncHandler(async (req, res) => {
  const item = await Testimonial.create(req.body);
  sendSuccess(res, { status: 201, data: item, message: 'Testimonial created' });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.valid.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw ApiError.notFound('Testimonial not found');
  sendSuccess(res, { data: item, message: 'Testimonial updated' });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.valid.params.id);
  if (!item) throw ApiError.notFound('Testimonial not found');
  sendSuccess(res, { message: 'Testimonial deleted' });
});
