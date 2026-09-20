import MediaAsset from '../models/MediaAsset.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import ShowroomItem from '../models/ShowroomItem.js';
import ContentSection from '../models/ContentSection.js';
import ResumeVersion from '../models/ResumeVersion.js';
import SocialLink from '../models/SocialLink.js';
import Setting from '../models/Setting.js';
import { ApiError } from '../utils/ApiError.js';
import { deliveryUrl } from './cloudinary/service.js';
function refs(value, ids = new Set()) {
  if (!value || typeof value !== 'object') return ids;
  if (typeof value.mediaId === 'string') ids.add(value.mediaId);
  for (const entry of Object.values(value)) refs(entry, ids);
  return ids;
}
export async function validateReferences(value) {
  const ids = [...refs(value)];
  if (!ids.length) return;
  const count = await MediaAsset.countDocuments({ _id: { $in: ids }, assetType: 'image', status: 'ready' });
  if (count !== ids.length) throw new ApiError(422, 'One of the selected images is missing or unavailable. Choose another asset.');
}
export async function hydrateMedia(value) {
  // Normalize Mongoose objects before walking; only image delivery data becomes public.
  const data = JSON.parse(JSON.stringify(value));
  const ids = [...refs(data)];
  if (!ids.length) return data;
  const assets = await MediaAsset.find({ _id: { $in: ids }, assetType: 'image', status: 'ready' }).lean();
  const byId = new Map(assets.map((asset) => [String(asset._id), asset]));
  function visit(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry.mediaId) {
      const asset = byId.get(entry.mediaId);
      return asset ? { ...entry, url: deliveryUrl(asset), width: asset.width, height: asset.height,
        altText: entry.altText || asset.altText, caption: entry.caption || asset.caption } : { ...entry, url: '' };
    }
    return Array.isArray(entry) ? entry.map(visit) : Object.fromEntries(Object.entries(entry).map(([key, val]) => [key, visit(val)]));
  }
  return visit(data);
}
export async function assetUsage(asset) {
  const id = String(asset._id);
  const usage = [];
  function used(value) {
    if (typeof value === 'string') {
      if (value === id || value === asset.secureUrl) return true;
      try {
        const url = new URL(value);
        const pathname = decodeURIComponent(url.pathname);
        const marker = '/' + asset.publicId;
        return url.hostname === 'res.cloudinary.com' && (pathname.endsWith(marker) || pathname.includes(marker + '.'));
      } catch { return false; }
    }
    return value && typeof value === 'object' && Object.values(value).some(used);
  }
  for (const [kind, Model] of [['Identity', Profile], ['Project', Project], ['Skill', Skill], ['Showroom', ShowroomItem], ['Section', ContentSection], ['Social link', SocialLink], ['Setting', Setting]]) {
    const cursor = Model.find().lean().cursor();
    for await (const doc of cursor) {
      if (used(doc)) usage.push({ kind, id: String(doc._id), label: doc.title || doc.name || doc.label || doc.key || kind });
    }
  }
  const versions = await ResumeVersion.find({ media: asset._id }).select('version').lean();
  for (const row of versions) usage.push({ kind: 'Resume', id: String(row._id), label: 'Resume v' + row.version });
  return usage;
}
