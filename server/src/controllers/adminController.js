import Property from '../models/Property.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import ContactMessage from '../models/ContactMessage.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import SiteSetting from '../models/SiteSetting.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/tokens.js';
import { SORT_OPTIONS } from '../validators/propertyValidators.js';
import { PUBLIC_PERSON_FIELDS, deleteProperty, updateProperty } from '../services/propertyService.js';
import { revokeAllSessions } from '../services/tokenService.js';

const toCounts = (rows) => Object.fromEntries(rows.map((r) => [r._id ?? 'unknown', r.count]));

export const dashboard = asyncHandler(async (_req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    usersByRole, propertiesByStatus, propertiesByListing, propertiesByType, monthlyListings, monthlyUsers,
    inquiriesByStatus, topCities, recentUsers, recentProperties, subscribers, newMessages,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Property.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Property.aggregate([{ $group: { _id: '$listingType', count: { $sum: 1 } } }]),
    Property.aggregate([{ $group: { _id: '$propertyType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Property.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          sale: { $sum: { $cond: [{ $eq: ['$listingType', 'sale'] }, 1, 0] } },
          rent: { $sum: { $cond: [{ $eq: ['$listingType', 'rent'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Property.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt isActive').lean(),
    Property.find().sort({ createdAt: -1 }).limit(5).select('title slug status listingType price currency city images createdAt').populate('owner', 'name').lean(),
    NewsletterSubscriber.countDocuments({ isActive: true }),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);

  // Fill in empty months so the chart always shows the last six months.
  const months = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const listing = monthlyListings.find((r) => r._id.y === y && r._id.m === m);
    const users = monthlyUsers.find((r) => r._id.y === y && r._id.m === m);
    months.push({
      month: d.toLocaleString('en', { month: 'short' }),
      sale: listing?.sale || 0,
      rent: listing?.rent || 0,
      users: users?.count || 0,
    });
  }

  const roles = toCounts(usersByRole);
  const statuses = toCounts(propertiesByStatus);
  const listing = toCounts(propertiesByListing);
  const inquiries = toCounts(inquiriesByStatus);

  sendSuccess(res, {
    data: {
      totals: {
        users: Object.values(roles).reduce((a, b) => a + b, 0),
        agents: roles.agent || 0,
        admins: roles.admin || 0,
        properties: Object.values(statuses).reduce((a, b) => a + b, 0),
        approved: statuses.approved || 0,
        pending: statuses.pending || 0,
        rejected: statuses.rejected || 0,
        drafts: statuses.draft || 0,
        sale: listing.sale || 0,
        rent: listing.rent || 0,
        inquiries: Object.values(inquiries).reduce((a, b) => a + b, 0),
        newInquiries: inquiries.new || 0,
        subscribers,
        newMessages,
      },
      charts: {
        monthly: months,
        propertyTypes: propertiesByType.map((r) => ({ name: r._id, value: r.count })),
        inquiryStatus: Object.entries(inquiries).map(([name, value]) => ({ name, value })),
        topCities: topCities.map((r) => ({ name: r._id, value: r.count })),
      },
      recentUsers,
      recentProperties,
    },
  });
});

/* ---------------------------------- Properties ---------------------------------- */

export const listProperties = asyncHandler(async (req, res) => {
  const { q, status, listingType, featured, sort } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = {};
  if (status) filter.status = status;
  if (listingType) filter.listingType = listingType;
  if (featured) filter.featured = featured === 'true';
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { city: rx }, { slug: rx }];
  }
  const sortBy = sort === 'newest' || sort === 'oldest' ? { createdAt: sort === 'newest' ? -1 : 1 } : SORT_OPTIONS[sort];

  const [items, total] = await Promise.all([
    Property.find(filter).populate('owner', 'name email').populate('category', 'name').sort(sortBy).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.valid.params.id)
    .populate('owner', PUBLIC_PERSON_FIELDS)
    .populate('agent', PUBLIC_PERSON_FIELDS)
    .populate('category', 'name slug')
    .lean();
  if (!property) throw ApiError.notFound('Property not found');
  sendSuccess(res, { data: property });
});

async function setStatus(id, update, adminId, event) {
  const property = await Property.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!property) throw ApiError.notFound('Property not found');
  logger.security(event, { propertyId: String(id), adminId: String(adminId) });
  return property;
}

export const approveProperty = asyncHandler(async (req, res) => {
  const existing = await Property.findById(req.valid.params.id).select('publishedAt images');
  if (!existing) throw ApiError.notFound('Property not found');
  if (!existing.images.length) throw ApiError.badRequest('A listing needs at least one image before it can be approved');
  const property = await setStatus(
    req.valid.params.id,
    { status: 'approved', rejectionReason: '', publishedAt: existing.publishedAt || new Date() },
    req.user._id,
    'property_approved',
  );
  sendSuccess(res, { data: property, message: 'Listing approved' });
});

export const rejectProperty = asyncHandler(async (req, res) => {
  const property = await setStatus(
    req.valid.params.id,
    { status: 'rejected', rejectionReason: req.body.reason, featured: false },
    req.user._id,
    'property_rejected',
  );
  sendSuccess(res, { data: property, message: 'Listing rejected' });
});

export const featureProperty = asyncHandler(async (req, res) => {
  const existing = await Property.findById(req.valid.params.id).select('status');
  if (!existing) throw ApiError.notFound('Property not found');
  if (req.body.featured && existing.status !== 'approved') throw ApiError.badRequest('Only approved listings can be featured');
  const property = await setStatus(req.valid.params.id, { featured: req.body.featured }, req.user._id, 'property_featured_changed');
  sendSuccess(res, { data: property, message: req.body.featured ? 'Listing featured' : 'Listing unfeatured' });
});

export const updatePropertyStatus = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.status === 'approved') update.publishedAt = new Date();
  if (update.status && update.status !== 'approved') update.featured = false;
  const property = await setStatus(req.valid.params.id, update, req.user._id, 'property_status_changed');
  sendSuccess(res, { data: property, message: 'Listing status updated' });
});

export const editProperty = asyncHandler(async (req, res) => {
  const property = await updateProperty(req.valid.params.id, req.body, req.user, { asAdmin: true });
  sendSuccess(res, { data: property, message: 'Listing updated' });
});

export const removeProperty = asyncHandler(async (req, res) => {
  await deleteProperty(req.valid.params.id, req.user);
  logger.security('property_deleted_by_admin', { propertyId: req.valid.params.id, adminId: String(req.user._id) });
  sendSuccess(res, { message: 'Listing deleted' });
});

/* ------------------------------------ Users ------------------------------------- */

export const listUsers = asyncHandler(async (req, res) => {
  const { q, role, status } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const counts = await Property.aggregate([
    { $match: { owner: { $in: items.map((u) => u._id) } } },
    { $group: { _id: '$owner', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  const safe = items.map(({ passwordHash, passwordChangedAt, __v, ...u }) => ({ ...u, propertyCount: map.get(String(u._id)) || 0 }));
  sendSuccess(res, { data: safe, meta: buildMeta(total, page, limit) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.valid.params.id);
  if (!user) throw ApiError.notFound('User not found');
  const [properties, inquiriesSent, inquiriesReceived] = await Promise.all([
    Property.find({ owner: user._id }).select('title slug status listingType price currency city createdAt').sort({ createdAt: -1 }).limit(20).lean(),
    Inquiry.countDocuments({ sender: user._id }),
    Inquiry.countDocuments({ recipient: user._id }),
  ]);
  sendSuccess(res, { data: { user, properties, inquiriesSent, inquiriesReceived } });
});

/** Guards against an admin locking everyone out of the admin panel. */
async function assertNotLastAdmin(target) {
  if (target.role !== 'admin' || !target.isActive) return;
  const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
  if (activeAdmins <= 1) throw ApiError.badRequest('This is the last active administrator and cannot be demoted or suspended');
}

export const changeRole = asyncHandler(async (req, res) => {
  const target = await User.findById(req.valid.params.id);
  if (!target) throw ApiError.notFound('User not found');
  if (String(target._id) === String(req.user._id)) throw ApiError.badRequest('You cannot change your own role');
  if (target.role === req.body.role) return sendSuccess(res, { data: target, message: 'Role unchanged' });
  if (target.role === 'admin') await assertNotLastAdmin(target);

  const previous = target.role;
  target.role = req.body.role;
  await target.save();
  await revokeAllSessions(target._id); // Force fresh sessions so the new role takes effect cleanly.
  logger.security('user_role_changed', { targetId: String(target._id), from: previous, to: target.role, adminId: String(req.user._id) });
  return sendSuccess(res, { data: target, message: `Role changed to ${target.role}` });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const target = await User.findById(req.valid.params.id);
  if (!target) throw ApiError.notFound('User not found');
  if (String(target._id) === String(req.user._id)) throw ApiError.badRequest('You cannot suspend your own account');
  if (!req.body.isActive) await assertNotLastAdmin(target);

  target.isActive = req.body.isActive;
  await target.save();
  if (!target.isActive) await revokeAllSessions(target._id);
  logger.security(target.isActive ? 'user_activated' : 'user_suspended', { targetId: String(target._id), adminId: String(req.user._id) });
  sendSuccess(res, { data: target, message: target.isActive ? 'Account activated' : 'Account suspended' });
});

/* --------------------------------- Inquiries ------------------------------------ */

export const listInquiries = asyncHandler(async (req, res) => {
  const { status, q } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { message: rx }];
  }
  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .populate('property', 'title slug')
      .populate('recipient', 'name email')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Inquiry.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const deleteInquiry = asyncHandler(async (req, res) => {
  const deleted = await Inquiry.findByIdAndDelete(req.valid.params.id);
  if (!deleted) throw ApiError.notFound('Inquiry not found');
  sendSuccess(res, { message: 'Inquiry deleted' });
});

/* ------------------------------ Contact messages -------------------------------- */

export const listMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = ['new', 'in-progress', 'resolved'].includes(req.query.status) ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.valid.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!message) throw ApiError.notFound('Message not found');
  sendSuccess(res, { data: message, message: 'Message updated' });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const deleted = await ContactMessage.findByIdAndDelete(req.valid.params.id);
  if (!deleted) throw ApiError.notFound('Message not found');
  sendSuccess(res, { message: 'Message deleted' });
});

/* --------------------------------- Settings ------------------------------------- */

export const getSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, { data: await SiteSetting.getSingleton() });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { socialLinks, ...rest } = req.body;
  const update = { ...rest };
  if (socialLinks) for (const [k, v] of Object.entries(socialLinks)) update[`socialLinks.${k}`] = v;
  const settings = await SiteSetting.findOneAndUpdate({ key: 'site' }, { $set: update }, { new: true, upsert: true, runValidators: true });
  logger.security('site_settings_updated', { adminId: String(req.user._id) });
  sendSuccess(res, { data: settings, message: 'Settings saved' });
});
