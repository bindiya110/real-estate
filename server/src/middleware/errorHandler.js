import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

function normalize(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof ZodError) {
    return ApiError.badRequest(
      'Validation failed',
      err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return ApiError.badRequest(
      'Validation failed',
      Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    );
  }
  if (err instanceof mongoose.Error.CastError) return ApiError.badRequest(`Invalid value for ${err.path}`);
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return ApiError.conflict(`A record with this ${field} already exists`);
  }
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Each image must be 5 MB or smaller',
      LIMIT_FILE_COUNT: 'Too many files in one upload',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    };
    return ApiError.badRequest(messages[err.code] || 'File upload failed');
  }
  if (err?.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');
  if (err?.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body');
  if (err?.message?.startsWith('CORS')) return ApiError.forbidden('Origin not allowed');

  return new ApiError(500, 'Something went wrong. Please try again later.');
}

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const apiError = normalize(err);

  if (apiError.statusCode >= 500) {
    logger.error('unhandled_error', { path: req.originalUrl, method: req.method, error: err.message, stack: err.stack });
  }

  const body = { success: false, message: apiError.message, errors: apiError.errors || [] };
  if (apiError.code) body.code = apiError.code;
  if (!env.isProduction && apiError.statusCode >= 500) body.debug = err.message;

  res.status(apiError.statusCode).json(body);
}
