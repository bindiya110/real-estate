import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const build = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: env.isTest ? 10_000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler(req, res) {
      logger.security('rate_limited', { path: req.originalUrl, ip: req.ip });
      res.status(429).json({ success: false, message, errors: [], code: 'RATE_LIMITED' });
    },
  });

export const apiLimiter = build(15, 600, 'Too many requests. Please slow down.');
export const authLimiter = build(15, 20, 'Too many login attempts. Please try again in a few minutes.');
export const passwordResetLimiter = build(60, 5, 'Too many password reset requests. Please try again later.');
export const formLimiter = build(15, 15, 'Too many submissions. Please try again later.');
export const uploadLimiter = build(15, 60, 'Too many uploads. Please try again later.');
