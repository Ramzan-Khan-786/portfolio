import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  assetId: String,
  resourceType: { type: String, enum: ['image', 'raw'], required: true },
  deliveryType: { type: String, enum: ['upload', 'authenticated'], required: true },
  assetType: { type: String, enum: ['image', 'document'], required: true },
  category: { type: String, required: true, index: true },
  folder: String, format: String, originalFilename: String,
  displayName: { type: String, maxlength: 160 },
  secureUrl: { type: String, select: false },
  width: Number, height: Number, bytes: Number, checksum: String,
  altText: { type: String, default: '', maxlength: 300 },
  caption: { type: String, default: '', maxlength: 600 },
  tags: { type: [String], default: [] },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ready', 'deleting', 'delete-failed'], default: 'ready' },
  processing: { type: String, enum: ['original', 'background-removed'], default: 'original' },
}, { timestamps: true });
schema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('MediaAsset', schema);
