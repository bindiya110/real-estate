import bcrypt from 'bcrypt';
import env from '../config/env.js';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { randomToken, sha256 } from '../utils/tokens.js';
import { revokeAllSessions } from './tokenService.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './emailService.js';

const RESET_TTL_MS = 30 * 60 * 1000;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('estatehub-timing-guard', 10);

export const hashPassword = (password) => bcrypt.hash(password, env.BCRYPT_ROUNDS);

export async function register({ name, email, password, phone }) {
  const existing = await User.exists({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, phone, passwordHash: await hashPassword(password), role: 'user' });
  await createEmailVerification(user);
  logger.security('user_registered', { userId: String(user._id) });
  return user;
}

export async function login({ email, password }, req) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);

  if (!user || !valid) {
    logger.security('login_failed', { ip: req.ip });
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    logger.security('login_blocked_inactive', { userId: String(user._id) });
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  user.lastLoginAt = new Date();
  await user.save();
  logger.security('login_success', { userId: String(user._id), ip: req.ip });
  return user;
}

export async function createEmailVerification(user) {
  await EmailVerificationToken.deleteMany({ user: user._id });
  const raw = randomToken(32);
  await EmailVerificationToken.create({ user: user._id, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + VERIFY_TTL_MS) });
  await sendVerificationEmail(user, raw);
}

export async function verifyEmail(rawToken) {
  const record = await EmailVerificationToken.findOne({ tokenHash: sha256(rawToken), usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) throw ApiError.badRequest('This verification link is invalid or has expired');
  record.usedAt = new Date();
  await record.save();
  const user = await User.findByIdAndUpdate(record.user, { isEmailVerified: true }, { new: true });
  logger.security('email_verified', { userId: String(record.user) });
  return user;
}

/** Always resolves without revealing whether the email is registered. */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return;

  await PasswordResetToken.deleteMany({ user: user._id });
  const raw = randomToken(32);
  await PasswordResetToken.create({ user: user._id, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + RESET_TTL_MS) });
  await sendPasswordResetEmail(user, raw);
  logger.security('password_reset_requested', { userId: String(user._id) });
}

export async function resetPassword(rawToken, newPassword) {
  const record = await PasswordResetToken.findOne({ tokenHash: sha256(rawToken), usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) throw ApiError.badRequest('This reset link is invalid or has expired');

  record.usedAt = new Date();
  await record.save();

  await User.findByIdAndUpdate(record.user, {
    passwordHash: await hashPassword(newPassword),
    passwordChangedAt: new Date(),
  });
  await revokeAllSessions(record.user);
  logger.security('password_reset_completed', { userId: String(record.user) });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.badRequest('Current password is incorrect', [{ field: 'currentPassword', message: 'Current password is incorrect' }]);

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();
  await revokeAllSessions(user._id);
  logger.security('password_changed', { userId: String(user._id) });
  return user;
}
