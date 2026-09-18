import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
