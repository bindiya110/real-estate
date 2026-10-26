import env from './config/env.js';
import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { cleanupOrphanUploads } from './services/uploadService.js';
import { seedIfEmpty } from './scripts/seed.js';
import logger from './utils/logger.js';

async function start() {
  await connectDB();
  if (!env.isProduction && env.AUTO_SEED) await seedIfEmpty();

  const server = app.listen(env.PORT, () => {
    console.log(`[api] EstateHub API running on http://localhost:${env.PORT}/api/v1`);
  });

  const cleanupTimer = setInterval(() => {
    cleanupOrphanUploads().catch((err) => logger.warn('orphan_cleanup_failed', { error: err.message }));
  }, 60 * 60 * 1000);
  cleanupTimer.unref();

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (err) => logger.error('unhandled_rejection', { error: err?.message, stack: err?.stack }));

start().catch((err) => {
  console.error('[api] Failed to start:', err);
  process.exit(1);
});
