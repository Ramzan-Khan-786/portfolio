import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    googleId: { type: String, unique: true, sparse: true },
    emailVerified: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
