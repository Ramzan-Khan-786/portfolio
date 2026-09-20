import multer from 'multer';
import { z } from 'zod';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import Resume from '../models/Resume.js';
import ResumeVersion from '../models/ResumeVersion.js';
import MediaAsset from '../models/MediaAsset.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { currentResume, createResumeVersion, resumeAsset, versionView } from '../services/resumes.js';
import { readDocument } from '../services/cloudinary/service.js';
import { permanentlyDeleteMedia } from './mediaController.js';
import { importDrivePdf } from '../services/googleDrive.js';
import { audit } from '../services/logger.js';
const metadataSchema = z.object({ title: z.string().trim().min(1).max(120).default('Resume'), description: z.string().trim().max(600).default('') }).strict();
export const uploadPdf = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 2, parts: 3, fieldSize: 1000 } }).single('file');
export function resumeView(doc, row = null) {
  return { title: row?.title || doc?.title || 'Resume', description: row?.description || doc?.description || '',
    visible: doc?.visible ?? true, downloadEnabled: doc?.downloadEnabled ?? true,
    lastUpdated: row?.publishedAt?.toISOString?.().slice(0, 10) || doc?.lastUpdated || '',
    externalUrl: doc?.externalUrl || '', links: doc?.links || [],
    hasFile: Boolean(row || doc?.filename), version: row?.version || null,
    pageCount: row?.pageCount || null, size: row?.fileSize || doc?.size || 0,
    storage: row ? 'cloudinary' : doc?.filename ? 'legacy-local' : 'none' };
}
export const getResume = asyncHandler(async (req, res) => {
  const { settings, row } = await currentResume();
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, data: !req.user && settings?.visible === false ? { visible: false } : resumeView(settings, row) });
});
export const putResume = asyncHandler(async (req, res) => {
  await Resume.findOneAndUpdate({ key: 'primary' }, req.validatedBody, { upsert: true, new: true, runValidators: true });
  const { settings, row } = await currentResume();
  res.json({ ok: true, data: resumeView(settings, row) });
});
export const storeResume = asyncHandler(async (req, res) => {
  const parsed = metadataSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(422, 'Check the resume title and description.');
  const data = await createResumeVersion(req.file, req.user.id, parsed.data);
  res.status(201).json({ ok: true, data });
});
export const listResumes = asyncHandler(async (req, res) => {
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
  const settings = await Resume.findOne({ key: 'primary' }).lean();
  const [items, total] = await Promise.all([ResumeVersion.find().sort({ version: -1 }).skip((page - 1) * 20).limit(20).lean(), ResumeVersion.countDocuments()]);
  res.json({ ok: true, data: { items: items.map((row) => versionView(row, settings?.currentVersion)), total, page, pages: Math.max(1, Math.ceil(total / 20)) } });
});
export const editResume = asyncHandler(async (req, res) => {
  const input = metadataSchema.safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Check the resume title and description.');
  const row = await ResumeVersion.findByIdAndUpdate(req.params.id, input.data, { new: true, runValidators: true });
  if (!row) throw new ApiError(404, 'Resume version not found.');
  res.json({ ok: true, data: versionView(row, (await Resume.findOne({ key: 'primary' }))?.currentVersion) });
});
export const publishResume = asyncHandler(async (req, res) => {
  const row = await ResumeVersion.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Resume version not found.');
  await resumeAsset(row);
  if (!row.previewedAt) throw new ApiError(409, 'Open and review this PDF in the preview before publishing.');
  row.archived = false; row.publishedAt = new Date(); await row.save();
  // The singleton pointer is the sole source of publication truth: one atomic write, no multi-document status race.
  await Resume.findOneAndUpdate({ key: 'primary' }, { currentVersion: row._id, filename: '', size: 0 }, { upsert: true });
  audit('admin', 'resume.published', { userId: req.user.id, version: row.version });
  res.json({ ok: true, data: versionView(row, row._id) });
});
export const archiveResume = asyncHandler(async (req, res) => {
  const row = await ResumeVersion.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Resume version not found.');
  row.archived = true; row.archivedAt = new Date(); await row.save();
  await Resume.updateOne({ key: 'primary', currentVersion: row._id }, { currentVersion: null });
  audit('admin', 'resume.archived', { userId: req.user.id, version: row.version });
  res.json({ ok: true, data: versionView(row, null) });
});
export const deleteResume = asyncHandler(async (req, res) => {
  if (req.body?.confirm !== 'DELETE') throw new ApiError(422, 'Explicit deletion confirmation is required.');
  const row = await ResumeVersion.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Resume version not found.');
  const settings = await Resume.findOne({ key: 'primary' });
  if (String(settings?.currentVersion) === row.id) throw new ApiError(409, 'Archive the published resume or publish another version before deleting it.');
  const asset = await MediaAsset.findById(row.media);
  if (asset) await permanentlyDeleteMedia(asset);
  // If DB deletion fails after Cloudinary success, the version remains visible and deletion can be retried.
  await row.deleteOne();
  audit('admin', 'resume.deleted', { userId: req.user.id, version: row.version });
  res.status(204).end();
});
function sendPdf(req, res, bytes) {
  res.removeHeader('X-Frame-Options');
  res.set({ 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': (req.query.download === '1' ? 'attachment' : 'inline') + '; filename="resume.pdf"',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Content-Security-Policy': "default-src 'none'; sandbox; frame-ancestors 'self' " + env.origins.join(' ') });
  res.send(bytes);
}
export const previewResume = asyncHandler(async (req, res) => {
  const row = await ResumeVersion.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Resume version not found.');
  sendPdf(req, res, await readDocument(await resumeAsset(row)));
});
export const markPreviewed = asyncHandler(async (req, res) => {
  const row = await ResumeVersion.findByIdAndUpdate(req.params.id, { previewedAt: new Date() }, { new: true });
  if (!row) throw new ApiError(404, 'Resume version not found.');
  res.json({ ok: true, data: { previewedAt: row.previewedAt } });
});
export const serveResume = asyncHandler(async (req, res) => {
  const { settings, row } = await currentResume();
  if (settings?.visible === false) throw new ApiError(404, 'No published resume file.');
  if (req.query.download === '1' && settings?.downloadEnabled === false) throw new ApiError(403, 'Resume downloads are disabled.');
  if (row) return sendPdf(req, res, await readDocument(await resumeAsset(row)));
  // Read-only compatibility for existing files; no new upload ever writes to this directory.
  if (!settings?.filename || !/^[a-f0-9-]{36}\.pdf$/.test(settings.filename)) throw new ApiError(404, 'No published resume file.');
  const file = path.join(env.uploadDir, settings.filename);
  try { await access(file); sendPdf(req, res, await readFile(file)); }
  catch { throw new ApiError(404, 'Legacy file unavailable. Re-upload it through Resume Management.'); }
});
export const detachResume = asyncHandler(async (_req, res) => {
  await Resume.findOneAndUpdate({ key: 'primary' }, { currentVersion: null, filename: '', size: 0 });
  res.json({ ok: true, data: { hasFile: false } });
});
export const importResume = asyncHandler(async (req, res) => {
  const input = z.object({ fileId: z.string().regex(/^[\w-]{10,200}$/), accessToken: z.string().min(20).max(4096), title: z.string().trim().min(1).max(120).default('Resume') }).strict().safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Select a PDF through the Google Drive picker.');
  const file = await importDrivePdf(input.data);
  const data = await createResumeVersion(file, req.user.id, { source: 'google-drive', title: input.data.title });
  res.status(201).json({ ok: true, data });
});
export const resumeFromLibrary = asyncHandler(async (req, res) => {
  const input = z.object({ mediaId: z.string().regex(/^[a-f\d]{24}$/i) }).strict().safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Select a document from the media library.');
  const asset = await MediaAsset.findOne({ _id: input.data.mediaId, assetType: 'document', status: 'ready' });
  if (!asset) throw new ApiError(404, 'Document not found.');
  const data = await createResumeVersion({ buffer: await readDocument(asset), originalname: asset.originalFilename, mimetype: 'application/pdf' }, req.user.id, { source: 'library' });
  res.status(201).json({ ok: true, data });
});
