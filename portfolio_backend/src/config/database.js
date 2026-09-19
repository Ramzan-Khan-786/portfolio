import mongoose from 'mongoose';
import { env } from './env.js';
import { audit } from '../services/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  audit('application', 'database.connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
