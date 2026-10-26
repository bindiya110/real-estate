import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/authService.js';
import {
  REFRESH_COOKIE, clearAuthCookies, issueCsrfToken, issueSession, revokeCurrentSession, rotateSession,
} from '../services/tokenService.js';
import { optionalAuth } from '../middleware/authenticate.js';
import ApiError from '../utils/ApiError.js';

export const csrf = (req, res) => sendSuccess(res, { data: { csrfToken: issueCsrfToken(res) } });

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  await issueSession(res, user, req);
  sendSuccess(res, {
    status: 201,
    data: { user },
    message: 'Account created. Please check your email to verify your address.',
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body, req);
  await issueSession(res, user, req);
  sendSuccess(res, { data: { user }, message: 'Welcome back!' });
});

export const logout = asyncHandler(async (req, res) => {
  await revokeCurrentSession(req);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Logged out' });
});

export const refresh = asyncHandler(async (req, res) => {
  const user = await rotateSession(req, res, (id) => User.findById(id));
  sendSuccess(res, { data: { user } });
});

/**
 * Returns the signed-in user, or `user: null` for guests. If the access token has expired but a
 * refresh cookie exists, responds 401 TOKEN_EXPIRED so the client performs a silent refresh.
 */
export const me = [
  optionalAuth,
  (req, res, next) => {
    if (req.user) return sendSuccess(res, { data: { user: req.user } });
    if (req.cookies?.[REFRESH_COOKIE]) return next(ApiError.unauthorized('Session expired', 'TOKEN_EXPIRED'));
    return sendSuccess(res, { data: { user: null } });
  },
];

const GENERIC_RESET_MESSAGE = 'If an account exists for that email, a password reset link has been sent.';

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, { message: GENERIC_RESET_MESSAGE });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Your password has been reset. Please log in with your new password.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  sendSuccess(res, { data: { user }, message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) return sendSuccess(res, { message: 'Your email is already verified' });
  await authService.createEmailVerification(req.user);
  return sendSuccess(res, { message: 'Verification email sent' });
});
