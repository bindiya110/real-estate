import Property from '../models/Property.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/tokens.js';
import * as authService from '../services/authService.js';
import { issueSession } from '../services/tokenService.js';
import { ownerStats } from '../services/propertyService.js';
import { saveImages, deleteStoredUploads } from '../services/uploadService.js';
import Upload from '../models/Upload.js';

export const getMe = (req, res) => sendSuccess(res, { data: { user: req.user } });

export const updateMe = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  // Agent profile fields are only meaningful for agents.
  if (req.user.role === 'user') {
    delete updates.agency;
    delete updates.designation;
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  sendSuccess(res, { data: { user }, message: 'Profile updated' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const [upload] = await saveImages(req.file ? [req.file] : [], req.user, 'avatar');
  const previous = await Upload.find({ uploadedBy: req.user._id, kind: 'avatar', _id: { $ne: upload._id } });
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: upload.url }, { new: true });
  await deleteStoredUploads(previous);
  sendSuccess(res, { data: { user }, message: 'Profile photo updated' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  // All other sessions were revoked; keep this browser signed in with a fresh session.
  await issueSession(res, user, req);
  sendSuccess(res, { message: 'Password changed successfully' });
});

export const myProperties = asyncHandler(async (req, res) => {
  const { status, q } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = { owner: req.user._id };
  if (status) filter.status = status;
  if (q) filter.title = new RegExp(escapeRegex(q), 'i');

  const [items, total] = await Promise.all([
    Property.find(filter).populate('category', 'name slug').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: buildMeta(total, page, limit) });
});

export const myStats = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: await ownerStats(req.user._id) });
});
