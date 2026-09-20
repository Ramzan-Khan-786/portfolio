import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { ApiError } from '../../utils/ApiError.js';
import { validateResumePdf } from '../pdfValidation.js';
import { categories, imageTypes, IMAGE_LIMIT, ICON_LIMIT, PDF_LIMIT } from './constants.js';
export function safeFilename(value) {
  const name = String(value || 'asset').split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f]/g, '');
  return name.length > 180 ? name.slice(0, 164) + name.slice(-16) : name;
}
export async function validateAsset(file, category) {
  if (!categories.includes(category)) throw new ApiError(422, 'Select a valid media category.');
  if (!file?.buffer?.length) throw new ApiError(422, 'Choose one file to upload.');
  const document = ['resume', 'documents'].includes(category);
  const limit = document ? PDF_LIMIT : ['skills', 'tech-stack'].includes(category) ? ICON_LIMIT : IMAGE_LIMIT;
  if (file.buffer.length > limit) throw new ApiError(413, 'This category allows files up to ' + limit / 1048576 + ' MB.');
  const originalFilename = safeFilename(file.originalname);
  const checksum = createHash('sha256').update(file.buffer).digest('hex');
  if (document) {
    if (file.mimetype !== 'application/pdf' || !/\.pdf$/i.test(originalFilename) || file.buffer.subarray(0, 5).toString() !== '%PDF-')
      throw new ApiError(422, 'Choose a genuine PDF document.');
    const result = await validateResumePdf(file.buffer);
    return { buffer: file.buffer, checksum, originalFilename, pageCount: result.pageCount, assetType: 'document', format: 'pdf' };
  }
  if (!imageTypes.includes(file.mimetype) || !/\.(jpe?g|png|webp)$/i.test(originalFilename))
    throw new ApiError(422, 'Use JPEG, PNG or WebP. SVG uploads are deliberately disabled.');
  try {
    const image = sharp(file.buffer, { limitInputPixels: 25000000, failOn: 'warning' });
    const metadata = await image.metadata();
    const mime = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[metadata.format];
    if (mime !== file.mimetype || (metadata.pages || 1) > 1) throw new Error('Format mismatch or animation');
    // Decode/re-encode, strip metadata and retain alpha; never trust a renamed HTML/SVG file.
    const result = await image.rotate().resize({ width: 4096, height: 4096, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
    return { buffer: result.data, width: result.info.width, height: result.info.height, checksum, originalFilename, assetType: 'image', format: 'webp' };
  } catch {
    throw new ApiError(422, 'Use a readable, static JPEG, PNG or WebP image under 25 megapixels.');
  }
}
