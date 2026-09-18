import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, default: '' },
    body: { type: String, required: true },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export default mongoose.model('Page', schema);
