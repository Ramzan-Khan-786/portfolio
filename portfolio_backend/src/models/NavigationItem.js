import mongoose from 'mongoose';

const navigationItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    type: { type: String, enum: ['anchor', 'route', 'external', 'action'], default: 'anchor' },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    visibleOnDesktop: { type: Boolean, default: true },
    visibleOnMobile: { type: Boolean, default: true },
  },
  { timestamps: true },
);

navigationItemSchema.index({ enabled: 1, order: 1 });
export default mongoose.model('NavigationItem', navigationItemSchema);
