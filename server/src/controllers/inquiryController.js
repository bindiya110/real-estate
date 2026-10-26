import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { sendInquiryNotification } from '../services/emailService.js';

const POPULATE = [
  { path: 'property', select: 'title slug images city price currency listingType' },
  { path: 'sender', select: 'name avatar' },
  { path: 'recipient', select: 'name avatar agency' },
];

const isParticipant = (inquiry, user) =>
  [String(inquiry.sender?._id ?? inquiry.sender), String(inquiry.recipient?._id ?? inquiry.recipient)].includes(String(user._id));

/** The recipient is always derived server-side from the listing or agent, never from the request body. */
export const create = asyncHandler(async (req, res) => {
  const { propertyId, agentId, ...contact } = req.body;
  let recipientId;
  let property = null;

  if (propertyId) {
    property = await Property.findOne({ _id: propertyId, status: 'approved' }).select('title owner agent');
    if (!property) throw ApiError.notFound('Property not found');
    recipientId = property.agent || property.owner;
  } else {
    const agent = await User.findOne({ _id: agentId, role: 'agent', isActive: true }).select('_id');
    if (!agent) throw ApiError.notFound('Agent not found');
    recipientId = agent._id;
  }

  if (req.user && String(req.user._id) === String(recipientId)) {
    throw ApiError.badRequest('You cannot send an inquiry to yourself');
  }

  const inquiry = await Inquiry.create({
    ...contact,
    property: property?._id,
    sender: req.user?._id,
    recipient: recipientId,
  });

  const recipient = await User.findById(recipientId).select('name email');
  sendInquiryNotification(recipient, inquiry, property?.title).catch((err) => logger.warn('inquiry_email_failed', { error: err.message }));

  sendSuccess(res, { status: 201, data: { _id: inquiry._id }, message: 'Your message has been sent to the agent' });
});

export const getOne = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.valid.params.id).populate(POPULATE).lean();
  if (!inquiry || (!isParticipant(inquiry, req.user) && req.user.role !== 'admin')) throw ApiError.notFound('Inquiry not found');
  sendSuccess(res, { data: inquiry });
});

export const mine = asyncHandler(async (req, res) => {
  const { box, status } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = box === 'sent' ? { sender: req.user._id } : { recipient: req.user._id };
  if (status) filter.status = status;

  const [items, total, unread] = await Promise.all([
    Inquiry.find(filter).populate(POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
    Inquiry.countDocuments({ recipient: req.user._id, status: 'new' }),
  ]);
  sendSuccess(res, { data: items, meta: { ...buildMeta(total, page, limit), unread } });
});

/** Only the recipient (or an admin) can change an inquiry's status. */
export const updateStatus = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.valid.params.id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  const isRecipient = String(inquiry.recipient) === String(req.user._id);
  if (!isRecipient && req.user.role !== 'admin') throw ApiError.forbidden();

  inquiry.status = req.body.status;
  await inquiry.save();
  sendSuccess(res, { data: inquiry, message: 'Inquiry updated' });
});
