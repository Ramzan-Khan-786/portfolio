import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { PDF_LIMIT } from './cloudinary/constants.js';
export async function importDrivePdf({ fileId, accessToken }) {
  if (!env.googleDriveClientId || !env.googleDriveApiKey || !env.googleDriveAppId)
    throw new ApiError(503, 'Google Drive import is not configured. Download the PDF from Drive and use local upload.');
  // A file ID only: never fetch a client-supplied URL, follow redirects, or persist this token.
  const base = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId);
  const options = { headers: { Authorization: 'Bearer ' + accessToken }, redirect: 'error', signal: AbortSignal.timeout(30000) };
  const metadata = await fetch(base + '?fields=id,name,mimeType,size&supportsAllDrives=true', options).catch(() => null);
  if (!metadata?.ok) throw new ApiError(422, 'Drive access expired or this file is not accessible. Select the PDF again.');
  const info = await metadata.json();
  if (info.mimeType !== 'application/pdf' || Number(info.size) > PDF_LIMIT)
    throw new ApiError(422, 'Select a PDF under 5 MB. Export Google Docs to PDF first.');
  const response = await fetch(base + '?alt=media&supportsAllDrives=true', { ...options, signal: AbortSignal.timeout(30000) }).catch(() => null);
  if (!response?.ok) throw new ApiError(502, 'Google Drive could not return this PDF.');
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > PDF_LIMIT) throw new ApiError(413, 'Drive PDF exceeds 5 MB.');
    chunks.push(Buffer.from(chunk));
  }
  return { buffer: Buffer.concat(chunks), originalname: info.name, mimetype: 'application/pdf' };
}
