import mongoose from "mongoose";

const globalMongoose = globalThis;
if (!globalMongoose.__asianStoreMongoose) {
  globalMongoose.__asianStoreMongoose = { connection: null, promise: null };
}
const cache = globalMongoose.__asianStoreMongoose;

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI is required for database access.");
  if (cache.connection?.readyState === 1) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
      serverSelectionTimeoutMS: 10000,
    }).then((instance) => instance.connection).catch((error) => {
      cache.promise = null;
      throw error;
    });
  }
  cache.connection = await cache.promise;
  return cache.connection;
}
