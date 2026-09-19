import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    key: { type: String, default: 'primary', unique: true },
    title: { type: String, default: 'Resume' },
    description: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    downloadEnabled: { type: Boolean, default: true },
    externalUrl: { type: String, default: '' },
    lastUpdated: { type: String, default: '' },
    links: [{ label: String, url: String, _id: false }],
    filename: { type: String, default: '', select: false },
    size: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export default mongoose.model('Resume', schema);
