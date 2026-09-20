import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  version: { type: Number, required: true, unique: true },
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 600 },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset', required: true, unique: true },
  checksum: { type: String, required: true, unique: true },
  originalFilename: String, fileSize: Number, pageCount: Number,
  source: { type: String, enum: ['local', 'google-drive', 'library'], default: 'local' },
  archived: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  previewedAt: Date, publishedAt: Date, archivedAt: Date,
}, { timestamps: true });
export default mongoose.model('ResumeVersion', schema);
