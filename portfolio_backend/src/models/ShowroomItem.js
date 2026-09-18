import mongoose from 'mongoose';

const showroomItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    description: { type: String, trim: true, default: '' },
    presentationType: {
      type: String,
      enum: ['sandbox', 'iframe', 'coming-soon'],
      default: 'coming-soon',
    },
    externalUrl: { type: String, trim: true, default: '' },
    embedUrl: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['live', 'coming-soon'], default: 'coming-soon' },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

showroomItemSchema.index({ enabled: 1, order: 1 });
export default mongoose.model('ShowroomItem', showroomItemSchema);
