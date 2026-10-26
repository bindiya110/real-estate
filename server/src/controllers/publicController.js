import mongoose from 'mongoose';
import User, { PUBLIC_USER_FIELDS } from '../models/User.js';
import Property from '../models/Property.js';
import ContactMessage from '../models/ContactMessage.js';
import SiteSetting from '../models/SiteSetting.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/tokens.js';

export const listAgents = asyncHandler(async (req, res) => {
  const { q, city } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = { role: 'agent', isActive: true };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { agency: rx }, { city: rx }];
  }
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');

  const [agents, total] = await Promise.all([
    User.find(filter).select(PUBLIC_USER_FIELDS).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const counts = await Property.aggregate([
    { $match: { status: 'approved', agent: { $in: agents.map((a) => a._id) } } },
    { $group: { _id: '$agent', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  const items = agents.map((a) => ({ ...a, listingCount: map.get(String(a._id)) || 0 }));

  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const featuredAgents = asyncHandler(async (_req, res) => {
  const top = await Property.aggregate([
    { $match: { status: 'approved', agent: { $ne: null } } },
    { $group: { _id: '$agent', listingCount: { $sum: 1 } } },
    { $sort: { listingCount: -1 } },
    { $limit: 4 },
  ]);
  const agents = await User.find({ _id: { $in: top.map((t) => t._id) }, isActive: true, role: 'agent' }).select(PUBLIC_USER_FIELDS).lean();
  const map = new Map(top.map((t) => [String(t._id), t.listingCount]));
  sendSuccess(res, {
    data: agents.map((a) => ({ ...a, listingCount: map.get(String(a._id)) || 0 })).sort((a, b) => b.listingCount - a.listingCount),
  });
});

export const getAgent = asyncHandler(async (req, res) => {
  const agent = await User.findOne({ _id: req.valid.params.id, role: 'agent', isActive: true }).select(PUBLIC_USER_FIELDS).lean();
  if (!agent) throw ApiError.notFound('Agent not found');
  const properties = await Property.find({ agent: new mongoose.Types.ObjectId(agent._id), status: 'approved' })
    .select('title slug listingType propertyType price currency city state bedrooms bathrooms area areaUnit images featured publishedAt')
    .sort({ publishedAt: -1 })
    .limit(24)
    .lean();
  sendSuccess(res, { data: { agent, properties } });
});

export const contact = asyncHandler(async (req, res) => {
  await ContactMessage.create({ ...req.body, user: req.user?._id });
  sendSuccess(res, { status: 201, message: 'Thanks for reaching out. Our team will get back to you shortly.' });
});

export const getSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, { data: await SiteSetting.getSingleton() });
});

export const stats = asyncHandler(async (_req, res) => {
  const [properties, agents, cities] = await Promise.all([
    Property.countDocuments({ status: 'approved' }),
    User.countDocuments({ role: 'agent', isActive: true }),
    Property.distinct('city', { status: 'approved' }),
  ]);
  sendSuccess(res, { data: { properties, agents, cities: cities.length } });
});
