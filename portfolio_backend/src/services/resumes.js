import mongoose from 'mongoose';
import Resume from '../models/Resume.js';
import ResumeVersion from '../models/ResumeVersion.js';
import MediaAsset from '../models/MediaAsset.js';
import { validateAsset } from './cloudinary/validation.js';
import { persistAsset } from './mediaStore.js';
import { deleteAsset } from './cloudinary/service.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from './logger.js';
const Counter = mongoose.model('ResumeCounter', new mongoose.Schema({ _id: String, value: Number }));
export function versionView(row, currentId) {
  const data = row.toObject ? row.toObject() : row;
  return { ...data, status: String(data._id) === String(currentId) ? 'published' : data.archived || data.publishedAt ? 'archived' : 'draft' };
}
export async function createResumeVersion(file, userId, { source = 'local', title = 'Resume', description = '' } = {}) {
  const validated = await validateAsset(file, 'resume');
  const duplicate = await ResumeVersion.findOne({ checksum: validated.checksum }).lean();
  if (duplicate) throw new ApiError(409, 'This PDF is identical to Resume v' + duplicate.version + '.', { resumeId: String(duplicate._id), version: duplicate.version });
  const counter = await Counter.findOneAndUpdate({ _id: 'resume' }, { $inc: { value: 1 } }, { upsert: true, new: true });
  const asset = await persistAsset(validated, { category: 'resume', version: counter.value }, userId);
  try {
    const row = await ResumeVersion.create({ version: counter.value, media: asset._id, checksum: validated.checksum,
      originalFilename: validated.originalFilename, fileSize: validated.buffer.length, pageCount: validated.pageCount,
      title, description, source, uploadedBy: userId });
    audit('admin', 'resume.uploaded', { userId, version: row.version, assetId: asset.id });
    return versionView(row, null);
  } catch (error) {
    try { await deleteAsset(asset); await asset.deleteOne(); }
    catch { audit('error', 'media.cleanup_failed', { assetId: asset.id }); }
    throw error;
  }
}
export async function currentResume() {
  const settings = await Resume.findOne({ key: 'primary' }).select('+filename').lean();
  const row = settings?.currentVersion ? await ResumeVersion.findById(settings.currentVersion).lean() : null;
  return { settings, row };
}
export async function resumeAsset(row) {
  const asset = row && await MediaAsset.findOne({ _id: row.media, status: 'ready', assetType: 'document' });
  if (!asset) throw new ApiError(404, 'Resume document unavailable.');
  return asset;
}
