import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { buildMeta, getPagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/tokens.js';
import ApiError from '../utils/ApiError.js';

export const subscribe = asyncHandler(async (req, res) => {
  await NewsletterSubscriber.updateOne(
    { email: req.body.email },
    { $set: { isActive: true, subscribedAt: new Date() }, $unset: { unsubscribedAt: 1 } },
    { upsert: true },
  );
  sendSuccess(res, { status: 201, message: 'Thanks for subscribing!' });
});

/** Responds the same way whether or not the email was subscribed. */
export const unsubscribe = asyncHandler(async (req, res) => {
  await NewsletterSubscriber.updateOne({ email: req.body.email }, { isActive: false, unsubscribedAt: new Date() });
  sendSuccess(res, { message: 'You have been unsubscribed' });
});

export const listAll = asyncHandler(async (req, res) => {
  const { q } = req.valid.query;
  const { page, limit, skip } = getPagination(req.valid.query);
  const filter = q ? { email: new RegExp(escapeRegex(q), 'i') } : {};
  const [items, total, active] = await Promise.all([
    NewsletterSubscriber.find(filter).sort({ subscribedAt: -1 }).skip(skip).limit(limit).lean(),
    NewsletterSubscriber.countDocuments(filter),
    NewsletterSubscriber.countDocuments({ isActive: true }),
  ]);
  sendSuccess(res, { data: items, meta: { ...buildMeta(total, page, limit), active } });
});

export const remove = asyncHandler(async (req, res) => {
  const deleted = await NewsletterSubscriber.findByIdAndDelete(req.valid.params.id);
  if (!deleted) throw ApiError.notFound('Subscriber not found');
  sendSuccess(res, { message: 'Subscriber removed' });
});
