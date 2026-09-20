import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { audit } from '../logger.js';
export const cloudinaryConfigured = () => Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
function client() {
  if (!cloudinaryConfigured()) throw new ApiError(503, 'Cloudinary is not configured. Add the backend credentials before uploading.');
  cloudinary.config({ cloud_name: env.cloudinaryCloudName, api_key: env.cloudinaryApiKey, api_secret: env.cloudinaryApiSecret, secure: true });
  return cloudinary;
}
export async function uploadAsset(validated, { category, version, projectSlug }) {
  const folder = [env.cloudinaryFolder, category, category === 'resume' ? 'v' + version : category === 'projects' ? projectSlug || 'unassigned' : ''].filter(Boolean).join('/');
  const document = validated.assetType === 'document';
  const publicId = folder + '/' + randomUUID() + (document ? '.pdf' : '');
  try {
    return await new Promise((resolve, reject) => {
      client().uploader.upload_stream({
        public_id: publicId, resource_type: document ? 'raw' : 'image',
        type: document ? 'authenticated' : 'upload', overwrite: false,
        timeout: 60000, ...(document ? {} : { format: 'webp' }),
      }, (error, result) => error ? reject(error) : resolve({ ...result, folder })).end(validated.buffer);
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    audit('error', 'media.upload_failed', { code: String(error.http_code || 'provider') });
    throw new ApiError(502, 'Cloudinary could not store the file. Check credentials, account limits and service availability.');
  }
}
export async function deleteAsset(asset) {
  try {
    const result = await client().uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType, type: asset.deliveryType, invalidate: true, timeout: 30000,
    });
    if (!['ok', 'not found'].includes(result.result)) throw new Error('Delete not confirmed');
  } catch {
    audit('error', 'media.delete_failed', { assetId: String(asset._id || '') });
    throw new ApiError(502, 'Cloudinary deletion was not confirmed. Metadata was retained; retry deletion.');
  }
}
export function deliveryUrl(asset, width = 1200) {
  if (asset.assetType !== 'image') return '';
  if (!env.cloudinaryCloudName) return '';
  return cloudinary.url(asset.publicId, { cloud_name: env.cloudinaryCloudName, secure: true, resource_type: 'image', type: 'upload',
    transformation: [{ width: Math.min(2000, Math.max(64, width)), crop: 'limit' }, { fetch_format: 'auto', quality: 'auto' }] });
}
export async function readDocument(asset) {
  const url = client().url(asset.publicId, { secure: true, resource_type: 'raw', type: 'authenticated', sign_url: true });
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'error' }).catch(() => null);
  if (!response?.ok) throw new ApiError(502, 'The stored PDF is temporarily unavailable. Check Cloudinary delivery permissions.');
  const parts = []; let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > 5 * 1024 * 1024) { throw new ApiError(413, 'Stored document exceeds the allowed size.'); }
    parts.push(Buffer.from(chunk));
  }
  return Buffer.concat(parts);
}
export async function backgroundRemovedUpload(asset) {
  if (!env.cloudinaryBackgroundRemoval) throw new ApiError(409, 'Automatic background removal is not enabled. Upload a transparent PNG or WebP instead.');
  // Generate a separate asset. Never mutate the original or its existing references.
  const url = client().url(asset.publicId, { secure: true, sign_url: true, transformation: [{ effect: 'background_removal' }, { fetch_format: 'png' }] });
  const response = await fetch(url, { signal: AbortSignal.timeout(45000), redirect: 'error' }).catch(() => null);
  if (!response?.ok) throw new ApiError(502, 'Background removal is unavailable or still processing. Your original is unchanged; retry later or upload a transparent icon.');
  const parts = []; let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > 2 * 1024 * 1024) throw new ApiError(413, 'Processed icon is too large. Upload a smaller transparent icon.');
    parts.push(Buffer.from(chunk));
  }
  return { buffer: Buffer.concat(parts), originalname: 'transparent-icon.png', mimetype: 'image/png' };
}
