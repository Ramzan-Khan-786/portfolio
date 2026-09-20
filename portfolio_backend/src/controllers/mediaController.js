import multer from 'multer';
import MediaAsset from '../models/MediaAsset.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { categories, IMAGE_LIMIT, PDF_LIMIT, ICON_LIMIT } from '../services/cloudinary/constants.js';
import { cloudinaryConfigured, deleteAsset, deliveryUrl, backgroundRemovedUpload, readDocument } from '../services/cloudinary/service.js';
import { storeAsset } from '../services/mediaStore.js';
import { assetUsage } from '../services/mediaReferences.js';
import { mediaUploadSchema, mediaMetadataSchema } from '../validation/media.js';
import { audit } from '../services/logger.js';
export const uploadMedia = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMAGE_LIMIT, files: 1, fields: 3, parts: 4, fieldSize: 1024 } }).single('file');
export function mediaView(asset) {
  const value = asset.toObject ? asset.toObject() : asset;
  const safe = { ...value };
  delete safe.secureUrl;
  delete safe.uploadedBy;
  return { ...safe, url: value.assetType === 'image' && value.status === 'ready' ? deliveryUrl(value) : '' };
}
export const mediaConfig = (_req, res) => res.json({ ok: true, data: {
  configured: cloudinaryConfigured(), backgroundRemoval: env.cloudinaryBackgroundRemoval && cloudinaryConfigured(),
  categories, limits: { image: IMAGE_LIMIT, icon: ICON_LIMIT, document: PDF_LIMIT },
  drive: { enabled: Boolean(env.googleDriveClientId && env.googleDriveApiKey && env.googleDriveAppId),
    clientId: env.googleDriveClientId, apiKey: env.googleDriveApiKey, appId: env.googleDriveAppId },
} });
export const listMedia = asyncHandler(async (req, res) => {
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
  const filter = {};
  if (categories.includes(req.query.category)) filter.category = req.query.category;
  if (['image', 'document'].includes(req.query.type)) filter.assetType = req.query.type;
  if (req.query.q) {
    const search = String(req.query.q).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['displayName', 'altText', 'tags'].map((key) => ({ [key]: { $regex: search, $options: 'i' } }));
  }
  const sort = req.query.sort === 'name' ? { displayName: 1, _id: 1 } : { createdAt: -1, _id: -1 };
  const [items, total] = await Promise.all([MediaAsset.find(filter).sort(sort).skip((page - 1) * 24).limit(24).lean(), MediaAsset.countDocuments(filter)]);
  res.json({ ok: true, data: { items: items.map(mediaView), total, page, pages: Math.max(1, Math.ceil(total / 24)) } });
});
export const getMedia = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id).select('+secureUrl');
  if (!asset) throw new ApiError(404, 'Media asset not found.');
  res.json({ ok: true, data: { ...mediaView(asset), usage: await assetUsage(asset) } });
});
export const previewMediaDocument = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findOne({ _id: req.params.id, assetType: 'document', status: 'ready' });
  if (!asset) throw new ApiError(404, 'Document unavailable.');
  const bytes = await readDocument(asset);
  res.set({ 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline; filename="document.pdf"', 'Content-Security-Policy': "default-src 'none'; sandbox" }).send(bytes);
});
export const createMedia = asyncHandler(async (req, res) => {
  const input = mediaUploadSchema.safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Choose a valid upload category and project slug.');
  if (input.data.category === 'resume') throw new ApiError(422, 'Use Resume Management to create a versioned PDF.');
  const asset = await storeAsset(req.file, input.data, req.user.id);
  audit('admin', 'media.uploaded', { userId: req.user.id, assetId: asset.id, category: asset.category });
  res.status(201).json({ ok: true, data: mediaView(asset) });
});
export const updateMedia = asyncHandler(async (req, res) => {
  const input = mediaMetadataSchema.safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Check the media metadata fields.', input.error.flatten());
  const asset = await MediaAsset.findOneAndUpdate({ _id: req.params.id, status: 'ready' }, input.data, { new: true, runValidators: true });
  if (!asset) throw new ApiError(404, 'Media asset unavailable.');
  res.json({ ok: true, data: mediaView(asset) });
});
export async function permanentlyDeleteMedia(asset) {
  await MediaAsset.updateOne({ _id: asset._id }, { status: 'deleting' });
  try {
    await deleteAsset(asset);
    await MediaAsset.deleteOne({ _id: asset._id });
  } catch (error) {
    await MediaAsset.updateOne({ _id: asset._id }, { status: 'delete-failed' }).catch(() => {});
    throw error;
  }
}
export const removeMedia = asyncHandler(async (req, res) => {
  if (req.body?.confirm !== 'DELETE') throw new ApiError(422, 'Explicit deletion confirmation is required.');
  const asset = await MediaAsset.findById(req.params.id).select('+secureUrl');
  if (!asset) throw new ApiError(404, 'Media asset not found.');
  const usage = await assetUsage(asset);
  if (usage.length) throw new ApiError(409, 'This asset is still in use. Remove its references first.', { usage });
  await permanentlyDeleteMedia(asset);
  audit('admin', 'media.deleted', { userId: req.user.id, assetId: req.params.id });
  res.status(204).end();
});
export const removeBackground = asyncHandler(async (req, res) => {
  const original = await MediaAsset.findOne({ _id: req.params.id, status: 'ready', assetType: 'image', category: { $in: ['skills', 'tech-stack'] } });
  if (!original) throw new ApiError(422, 'Select a skill or tech-stack image.');
  const file = await backgroundRemovedUpload(original);
  const asset = await storeAsset(file, { category: original.category }, req.user.id);
  asset.processing = 'background-removed'; asset.altText = original.altText;
  await asset.save();
  audit('admin', 'media.background_removed', { userId: req.user.id, assetId: asset.id });
  res.status(201).json({ ok: true, data: mediaView(asset) });
});
