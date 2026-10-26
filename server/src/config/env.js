import 'dotenv/config';
import { z } from 'zod';

const bool = (fallback) =>
  z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === 'true'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // Leave MONGODB_URI empty in development to use the embedded MongoDB (data persisted to disk).
  MONGODB_URI: z.string().optional().default(''),
  MONGO_EMBEDDED_DB_PATH: z.string().default('.mongo-data'),

  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  SERVER_PUBLIC_URL: z.string().url().default('http://localhost:5000'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

  COOKIE_SECURE: bool(false),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: bool(false),

  UPLOAD_MODE: z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('estatehub'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('EstateHub <no-reply@estatehub.local>'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  AUTO_SEED: bool(true),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === 'production') {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
  if (!env.COOKIE_SECURE) throw new Error('COOKIE_SECURE must be true in production');
  if (env.UPLOAD_MODE === 'cloudinary' && !env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials are required when UPLOAD_MODE=cloudinary');
  }
}

env.isProduction = env.NODE_ENV === 'production';
env.isTest = env.NODE_ENV === 'test';
env.allowedOrigins = env.CLIENT_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

export default env;
