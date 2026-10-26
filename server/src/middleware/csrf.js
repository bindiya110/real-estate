import ApiError from '../utils/ApiError.js';
import { safeEqual } from '../utils/tokens.js';
import { CSRF_COOKIE } from '../services/tokenService.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit CSRF protection for cookie-authenticated requests. The client obtains a token
 * from GET /auth/csrf (also set as an HttpOnly cookie) and echoes it in the X-CSRF-Token header.
 * A cross-site attacker can make the browser send the cookie but cannot read the token to set the header.
 */
export default function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (!safeEqual(cookieToken, headerToken)) {
    return next(new ApiError(403, 'Invalid or missing CSRF token. Please refresh and try again.', { code: 'CSRF_INVALID' }));
  }
  return next();
}
