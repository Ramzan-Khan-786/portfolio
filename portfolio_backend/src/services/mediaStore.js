import MediaAsset from '../models/MediaAsset.js';
import { validateAsset } from './cloudinary/validation.js';
import { uploadAsset, deleteAsset } from './cloudinary/service.js';
import { audit } from './logger.js';
export async function persistAsset(validated, options, userId) {
  const result = await uploadAsset(validated, options);
  const data = {
    publicId: result.public_id, assetId: result.asset_id, resourceType: result.resource_type,
    deliveryType: validated.assetType === 'document' ? 'authenticated' : 'upload',
    assetType: validated.assetType, category: options.category, folder: result.folder,
    secureUrl: result.secure_url, format: validated.format,
    originalFilename: validated.originalFilename, displayName: validated.originalFilename.slice(0, 160),
    width: result.width || validated.width, height: result.height || validated.height,
    bytes: result.bytes, checksum: validated.checksum, uploadedBy: userId,
  };
  try { return await MediaAsset.create(data); }
  catch (error) {
    try { await deleteAsset(data); }
    catch { audit('error', 'media.cleanup_failed', { publicId: data.publicId }); }
    throw error;
  }
}
export async function storeAsset(file, options, userId) {
  return persistAsset(await validateAsset(file, options.category), options, userId);
}
