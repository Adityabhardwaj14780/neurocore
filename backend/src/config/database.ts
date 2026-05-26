/**
 * Database configuration with production-grade connection handling.
 *
 * WHY THIS MATTERS:
 *   - Connection pooling prevents exhaustion under load.
 *   - Graceful shutdown closes connections cleanly (prevents zombie conns).
 *   - Reconnection logic handles transient network issues.
 *   - Deprecated `useNewUrlParser/useUnifiedTopology` removed (Mongoose 7+ defaults them).
 */

import mongoose from 'mongoose';
import config from './env';

let isConnected = false;

const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) return mongoose;

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: config.mongoPoolSize,
      serverSelectionTimeoutMS: config.mongoConnectTimeoutMs,
      socketTimeoutMS: 45000, // Kill stalled sockets after 45s
      // Retry on transient failures — critical for cloud-hosted Mongo (Atlas etc.)
      retryWrites: true,
      retryReads: true,
    });

    isConnected = true;

    console.log(
      `[db] Connected to ${conn.connection.host} (pool=${config.mongoPoolSize})`
    );

    // Graceful shutdown — close pool so the process can actually exit.
    const shutdown = async (signal: string) => {
      console.log(`[db] ${signal} received — closing MongoDB connection.`);
      try {
        await mongoose.connection.close();
        process.exit(0);
      } catch (err) {
        console.error('[db] Error during shutdown:', err);
        process.exit(1);
      }
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

    mongoose.connection.on('error', (err) => {
      console.error('[db] Connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('[db] Disconnected from MongoDB.');
      isConnected = false;
    });

    return conn;
  } catch (error: any) {
    console.error(`[db] Connection failed: ${error?.message}`);
    process.exit(1);
  }
};

export default connectDB;
