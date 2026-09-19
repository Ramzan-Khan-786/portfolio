import multer from 'multer';
import { validateResumePdf } from '../services/pdfValidation.js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Resume from '../models/Resume.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
const limit = 5 * 1024 * 1024;
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: limit, files: 1, fields: 0, parts: 1 },
  fileFilter: (_req, file, done) =>
    done(
      file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname)
        ? null
        : new ApiError(422, 'Upload a PDF file only.'),
      true,
    ),
}).single('file');
export function resumeView(doc) {
  if (!doc)
    return {
      title: 'Resume',
      description: '',
      visible: true,
      downloadEnabled: true,
      lastUpdated: '',
      externalUrl: '',
      links: [],
      hasFile: false,
    };
  const data = doc.toObject ? doc.toObject() : doc;
  return Object.fromEntries([
    ...[
      'title',
      'description',
      'visible',
      'downloadEnabled',
      'externalUrl',
      'lastUpdated',
      'links',
      'size',
      'updatedAt',
    ].map((key) => [key, data[key]]),
    ['hasFile', Boolean(data.filename)],
  ]);
}
export const getResume = asyncHandler(async (req, res) => {
  const doc = await Resume.findOne({ key: 'primary' }).select('+filename');
  res.json({
    ok: true,
    data: !req.user && doc?.visible === false ? { visible: false } : resumeView(doc),
  });
});
export const putResume = asyncHandler(async (req, res) => {
  const doc = await Resume.findOneAndUpdate({ key: 'primary' }, req.validatedBody, {
    upsert: true,
    new: true,
    runValidators: true,
  }).select('+filename');
  res.json({ ok: true, data: resumeView(doc) });
});
export const storeResume = asyncHandler(async (req, res) => {
  if (!req.file || req.file.buffer.subarray(0, 5).toString() !== '%PDF-')
    throw new ApiError(422, 'Upload a valid PDF document.');
  await validateResumePdf(req.file.buffer);
  await mkdir(env.uploadDir, { recursive: true });
  const filename = randomUUID() + '.pdf';
  await writeFile(path.join(env.uploadDir, filename), req.file.buffer, { flag: 'wx' });
  // Prior versions are retained for recovery; only the current UUID is publicly addressable.
  const doc = await Resume.findOneAndUpdate(
    { key: 'primary' },
    { filename, size: req.file.size, lastUpdated: new Date().toISOString().slice(0, 10) },
    { upsert: true, new: true },
  ).select('+filename');
  res.status(201).json({ ok: true, data: resumeView(doc) });
});
export const serveResume = asyncHandler(async (req, res, next) => {
  const doc = await Resume.findOne({ key: 'primary' }).select('+filename');
  if (!doc?.visible || !doc.filename) throw new ApiError(404, 'No published resume file.');
  if (req.query.download === '1' && !doc.downloadEnabled)
    throw new ApiError(403, 'Resume downloads are disabled.');
  if (!/^[a-f0-9-]{36}\.pdf$/.test(doc.filename))
    throw new ApiError(404, 'Resume file unavailable.');
  const file = path.join(env.uploadDir, doc.filename);
  try {
    await access(file);
  } catch {
    throw new ApiError(404, 'Resume file unavailable. Please contact the portfolio owner.');
  }
  res.removeHeader('X-Frame-Options');
  res.set({
    'Content-Type': 'application/pdf',
    'Cache-Control': 'no-store',
    'Content-Disposition':
      (req.query.download === '1' ? 'attachment' : 'inline') + '; filename="resume.pdf"',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Content-Security-Policy':
      "default-src 'none'; sandbox; frame-ancestors 'self' " + env.origins.join(' '),
  });
  res.sendFile(file, (error) => {
    if (error) next(error);
  });
});
export const detachResume = asyncHandler(async (_req, res) => {
  const doc = await Resume.findOneAndUpdate(
    { key: 'primary' },
    { filename: '', size: 0 },
    { new: true },
  ).select('+filename');
  res.json({ ok: true, data: resumeView(doc) });
});
