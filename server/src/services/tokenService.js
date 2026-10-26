import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { randomToken, sha256 } from '../utils/tokens.js';

export const ACCESS_COOKIE = 'eh_access';
export const REFRESH_COOKIE = 'eh_refresh';
export const CSRF_COOKIE = 'eh_csrf';

const API_PATH = '/api/v1';
const accessMaxAge = () => env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000;
const refreshMaxAge = () => env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

const baseCookie = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN || undefined,
});

export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id) }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
    issuer: 'estatehub',
  });
}

async function createRefreshToken(user, { family = crypto.randomUUID(), req } = {}) {
  const raw = randomToken(48);
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(raw + env.JWT_REFRESH_SECRET),
    family,
    expiresAt: new Date(Date.now() + refreshMaxAge()),
    userAgent: req?.get?.('user-agent')?.slice(0, 300),
    ip: req?.ip,
  });
  return raw;
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseCookie(), path: '/', maxAge: accessMaxAge() });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...baseCookie(), path: API_PATH, maxAge: refreshMaxAge() });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookie(), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookie(), path: API_PATH });
}

/** Starts a new session (new refresh-token family) and sets both auth cookies. */
export async function issueSession(res, user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user, { req });
  setAuthCookies(res, accessToken, refreshToken);
}

/**
 * Rotates a refresh token. Reusing a token that was already rotated revokes the entire family,
 * which limits the damage of a stolen refresh token.
 */
export async function rotateSession(req, res, loadUser) {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) throw ApiError.unauthorized('Session expired. Please log in again.');

  const tokenHash = sha256(raw + env.JWT_REFRESH_SECRET);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.expiresAt < new Date()) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Session expired. Please log in again.');
  }

  if (stored.revokedAt) {
    await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
    logger.security('refresh_token_reuse_detected', { userId: String(stored.user), family: stored.family, ip: req.ip });
    clearAuthCookies(res);
    throw ApiError.unauthorized('Session expired. Please log in again.');
  }

  const user = await loadUser(stored.user);
  if (!user || !user.isActive) {
    await RefreshToken.updateMany({ user: stored.user, revokedAt: null }, { revokedAt: new Date() });
    clearAuthCookies(res);
    throw ApiError.unauthorized('Your account is not active');
  }

  const nextRaw = await createRefreshToken(user, { family: stored.family, req });
  stored.revokedAt = new Date();
  stored.replacedByHash = sha256(nextRaw + env.JWT_REFRESH_SECRET);
  await stored.save();

  setAuthCookies(res, signAccessToken(user), nextRaw);
  return user;
}

export async function revokeCurrentSession(req) {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) return;
  const stored = await RefreshToken.findOne({ tokenHash: sha256(raw + env.JWT_REFRESH_SECRET) });
  if (stored) await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllSessions(userId) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export function issueCsrfToken(res) {
  const token = randomToken(24);
  res.cookie(CSRF_COOKIE, token, { ...baseCookie(), path: '/' });
  return token;
}
