import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    kind: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

socialLinkSchema.index({ enabled: 1, order: 1 });
export default mongoose.model('SocialLink', socialLinkSchema);
