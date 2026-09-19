import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    purpose: { type: String, enum: ['challenge', 'create', 'link'], required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('AuthAttempt', schema);
