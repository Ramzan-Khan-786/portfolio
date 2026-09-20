import { assetUrl, ApiRequestError } from './api.js';
export const mediaCategories = ['hero', 'profile', 'about', 'skills', 'tech-stack', 'projects', 'showroom', 'documents', 'misc'];
export function uploadRules(category) {
  const pdf = ['resume', 'documents'].includes(category);
  return { accept: pdf ? '.pdf,application/pdf' : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    types: pdf ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/webp'],
    limit: (pdf ? 5 : ['skills', 'tech-stack'].includes(category) ? 2 : 8) * 1048576 };
}
export function validateFile(file, category) {
  const rules = uploadRules(category);
  if (!file || !rules.types.includes(file.type)) throw new Error(category === 'resume' || category === 'documents' ? 'Choose a PDF document.' : 'Choose JPEG, PNG or WebP. SVG is not supported.');
  if (!file.size || file.size > rules.limit) throw new Error('Choose a file under ' + rules.limit / 1048576 + ' MB.');
}
export const mediaSelection = (asset) => ({ mediaId: asset._id, url: asset.url, altText: asset.altText || '', caption: asset.caption || '', width: asset.width, height: asset.height });
export function uploadFile(path, file, fields = {}, onProgress = () => {}) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise((resolve, reject) => {
    const body = new FormData();
    Object.entries(fields).forEach(([key, value]) => { if (value !== undefined && value !== '') body.append(key, value); });
    body.append('file', file);
    xhr.open('POST', assetUrl('/admin/' + path));
    xhr.withCredentials = true;
    xhr.timeout = 120000;
    xhr.setRequestHeader('X-Portfolio-Request', 'cms');
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => {
      let response;
      try { response = JSON.parse(xhr.responseText); } catch { /* Handled below. */ }
      if (xhr.status >= 200 && xhr.status < 300 && response?.ok) resolve(response.data);
      else {
        if (xhr.status === 401) window.dispatchEvent(new Event('portfolio:session-expired'));
        reject(new ApiRequestError(response?.error?.message || 'Upload failed. Please retry.', xhr.status, response?.error?.details));
      }
    };
    xhr.onerror = () => reject(new Error('Upload interrupted. Check the library before retrying; the server may have received it.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Check the library before retrying.'));
    xhr.onabort = () => reject(new Error('Upload cancelled locally. If processing had begun, the asset may still appear in the library.'));
    xhr.send(body);
  });
  return { promise, cancel: () => xhr.abort() };
}
export function optimizedImage(url, width = 1200) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com' || !parsed.pathname.includes('/image/upload/')) return url;
    // Existing signed/transformed URLs remain intact. Generated URLs already contain bounded delivery.
    if (!/\/image\/upload\/(v\d+\/)?[^/,]+\//.test(parsed.pathname)) return url;
    const marker = '/image/upload/';
    const tail = parsed.pathname.split(marker)[1];
    if (/^(s--|c_|w_|f_|q_|e_)/.test(tail)) return url;
    parsed.pathname = parsed.pathname.replace(marker, marker + 'c_limit,w_' + width + '/f_auto,q_auto/');
    return parsed.toString();
  } catch { return url; }
}
