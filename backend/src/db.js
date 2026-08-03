// ============================================================
// Pandora X — MongoDB 连接层 (mongoose)
// ============================================================
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // If a real MongoDB URI is configured, use it directly
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    }
  }

  // No external MongoDB — spin up an in-memory one automatically
  try {
    console.log('Starting in-memory MongoDB (this may take a few seconds on first run)...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`In-memory MongoDB ready at ${uri}`);
  } catch (err) {
    console.error('Failed to start in-memory MongoDB:', err.message);
    process.exit(1);
  }
}

// Clean shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  process.exit(0);
});

export { mongoose };
export default connectDB;
