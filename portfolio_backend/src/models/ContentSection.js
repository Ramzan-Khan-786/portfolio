import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero', 'profile', 'about', 'contact', 'footer', 'appearance'],
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
export default mongoose.model('ContentSection', schema);
