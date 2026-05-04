import mongoose from 'mongoose';
import { spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongodStarted: false };
}

const LOCAL_MONGO_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function getEnvLocalMongoUri() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    return null;
  }

  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  const match = envLocal.match(/^MONGODB_URI=(.*)$/m);
  return match?.[1]?.trim() || null;
}

function isLocalMongoUri(uri: string) {
  try {
    const parsed = new URL(uri);
    return parsed.protocol === 'mongodb:' && LOCAL_MONGO_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

function isConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'MongoServerSelectionError' ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('MongoServerSelectionError') ||
    error.message.includes('connect ECONNREFUSED')
  );
}

function getLocalMongoPort(uri: string) {
  try {
    const parsed = new URL(uri);
    return Number(parsed.port || 27017);
  } catch {
    return 27017;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForPort(port: number, host = '127.0.0.1', timeoutMs = 12000) {
  const startedAt = Date.now();

  return new Promise<void>((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host, port });

      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });

      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for MongoDB on ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 400);
      });
    };

    tryConnect();
  });
}

function isPortOpen(port: number, host = '127.0.0.1', timeoutMs = 800) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.once('error', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(false);
    });
  });
}

async function startLocalMongo(uri: string) {
  if (process.env.NODE_ENV === 'production' || process.env.MONGODB_AUTO_START === 'false') {
    return;
  }

  if (!isLocalMongoUri(uri)) {
    return;
  }

  const port = getLocalMongoPort(uri);
  if (await isPortOpen(port)) {
    cached.mongodStarted = true;
    return;
  }

  const mongodPath =
    process.env.MONGOD_PATH ||
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';

  if (!fs.existsSync(mongodPath)) {
    return;
  }

  const mongoRoot = path.join(process.cwd(), '.mongodb');
  const dbPath = path.join(mongoRoot, 'data');
  const logPath = path.join(mongoRoot, 'log', 'mongod.log');

  fs.mkdirSync(dbPath, { recursive: true });
  fs.mkdirSync(path.dirname(logPath), { recursive: true });

  const lockPath = path.join(dbPath, 'mongod.lock');

  if (fs.existsSync(lockPath)) {
    try {
      fs.rmSync(lockPath);
    } catch {
      // MongoDB will report the lock problem if it is still active.
    }
  }

  const child = spawn(
    mongodPath,
    [
      '--dbpath',
      dbPath,
      '--logpath',
      logPath,
      '--logappend',
      '--bind_ip',
      '127.0.0.1',
      '--port',
      String(port),
      '--wiredTigerCacheSizeGB',
      '0.25',
      '--setParameter',
      'diagnosticDataCollectionEnabled=false',
    ],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }
  );

  child.unref();
  cached.mongodStarted = true;

  await wait(500);
  try {
    await waitForPort(port);
  } catch (error) {
    cached.mongodStarted = false;
    throw error;
  }
}

async function connect(uri: string) {
  return mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 4000,
  });
}

export async function connectDB() {
  const MONGODB_URI = getEnvLocalMongoUri() || process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    await startLocalMongo(MONGODB_URI);

    cached.promise = connect(MONGODB_URI)
      .catch(async (error) => {
        if (!isConnectionError(error)) {
          throw error;
        }

        console.warn('[MongoDB] Local connection failed; attempting to start local MongoDB...');
        await startLocalMongo(MONGODB_URI);
        return connect(MONGODB_URI);
      })
      .then((mongoose) => {
        console.log('[MongoDB] Connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('[MongoDB] Connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Type augmentation for global mongoose
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    mongodStarted: boolean;
  };
}
