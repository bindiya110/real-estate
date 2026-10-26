import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    logger.security('authorization_denied', { userId: String(req.user._id), role: req.user.role, path: req.originalUrl });
    return next(ApiError.forbidden());
  }
  return next();
};

export default authorize;
