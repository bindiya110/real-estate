import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import env from './env.js';

const SERVER_ROOT = fileURLToPath(new URL('../../', import.meta.url));

let embeddedServer = null;

/**
 * Connects to MongoDB. When MONGODB_URI is empty outside production, an embedded
 * MongoDB instance is started with its data stored on disk so records persist
 * across restarts without installing MongoDB locally.
 */
export async function connectDB({ uri = env.MONGODB_URI, embeddedPath = env.MONGO_EMBEDDED_DB_PATH } = {}) {
  mongoose.set('strictQuery', true);

  let connectionUri = uri;
  if (!connectionUri) {
    // Keep the downloaded mongod binary inside this package regardless of the working directory.
    process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(SERVER_ROOT, 'node_modules', '.cache', 'mongodb-memory-server');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const instance = { storageEngine: 'wiredTiger' };
    if (embeddedPath) {
      const dbPath = path.resolve(SERVER_ROOT, embeddedPath);
      fs.mkdirSync(dbPath, { recursive: true });
      instance.dbPath = dbPath;
    }
    embeddedServer = await MongoMemoryServer.create({ instance });
    connectionUri = embeddedServer.getUri('estatehub');
    if (!env.isTest) console.log(`[db] Embedded MongoDB started${embeddedPath ? ` (data: ${instance.dbPath})` : ''}`);
  }

  await mongoose.connect(connectionUri, { autoIndex: !env.isProduction });
  if (!env.isTest) console.log(`[db] Connected to ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (embeddedServer) {
    await embeddedServer.stop();
    embeddedServer = null;
  }
}
