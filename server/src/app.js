import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import env from './config/env.js';
import csrfProtection from './middleware/csrf.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { LOCAL_UPLOAD_DIR } from './services/uploadService.js';
import { getDevOutbox } from './services/emailService.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

// In development any localhost port is accepted (Vite moves to 5174+ when 5173 is busy).
// Production only accepts the explicit CLIENT_ORIGINS allowlist.
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d{2,5}$/;
const isAllowedOrigin = (origin) =>
  env.allowedOrigins.includes(origin) || (!env.isProduction && LOCAL_ORIGIN.test(origin));

const app = express();

if (env.TRUST_PROXY) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    // Allow the client (another origin in production) to display images served from /uploads.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use('/uploads', express.static(LOCAL_UPLOAD_DIR, { maxAge: '7d', index: false, dotfiles: 'deny' }));

app.get('/api/v1/health', (_req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

const api = express.Router();
api.use(apiLimiter);
api.use(csrfProtection);
api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/properties', propertyRoutes);
api.use('/favorites', favoriteRoutes);
api.use('/inquiries', inquiryRoutes);
api.use('/categories', categoryRoutes);
api.use('/testimonials', testimonialRoutes);
api.use('/newsletter', newsletterRoutes);
api.use('/uploads', uploadRoutes);
api.use('/admin', adminRoutes);
api.use('/', publicRoutes);

if (!env.isProduction) {
  // Development-only email preview (verification & reset links) when no SMTP server is configured.
  api.get('/dev/emails', (_req, res) => res.json({ success: true, data: getDevOutbox() }));
}

app.use('/api/v1', api);
app.use(notFound);
app.use(errorHandler);

export default app;
