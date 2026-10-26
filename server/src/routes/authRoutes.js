import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import {
  forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema,
} from '../validators/authValidators.js';

const router = Router();

router.get('/csrf', auth.csrf);
router.post('/register', authLimiter, validate({ body: registerSchema }), auth.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refresh);
router.get('/me', auth.me);
router.post('/forgot-password', passwordResetLimiter, validate({ body: forgotPasswordSchema }), auth.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate({ body: resetPasswordSchema }), auth.resetPassword);
router.post('/verify-email', validate({ body: verifyEmailSchema }), auth.verifyEmail);
router.post('/resend-verification', authLimiter, authenticate, auth.resendVerification);

export default router;
