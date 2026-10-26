import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../services/tokenService.js';

function readAccessToken(req) {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/**
 * Resolves the current user from a verified access token. The role and status always come
 * from the database, never from the token payload or the request.
 */
async function resolveUser(req) {
  const token = readAccessToken(req);
  if (!token) return { user: null, reason: 'missing' };

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'], issuer: 'estatehub' });
  } catch (err) {
    return { user: null, reason: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' };
  }

  const user = await User.findById(payload.sub).select('+passwordChangedAt');
  if (!user || !user.isActive) return { user: null, reason: 'inactive' };
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
    return { user: null, reason: 'stale' };
  }
  return { user, reason: null };
}

export async function authenticate(req, _res, next) {
  try {
    const { user, reason } = await resolveUser(req);
    if (!user) {
      // Tell the client it can try a silent refresh when a refresh cookie is present.
      const canRefresh = Boolean(req.cookies?.[REFRESH_COOKIE]) && reason !== 'inactive';
      return next(ApiError.unauthorized(
        reason === 'inactive' ? 'Your account is not active' : 'Authentication required',
        canRefresh ? 'TOKEN_EXPIRED' : 'UNAUTHENTICATED',
      ));
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Attaches req.user when a valid session exists but never rejects the request. */
export async function optionalAuth(req, _res, next) {
  try {
    const { user } = await resolveUser(req);
    req.user = user || null;
    return next();
  } catch (err) {
    return next(err);
  }
}

export default authenticate;
