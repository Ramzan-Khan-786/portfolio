const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const assetUrl = (path) => baseUrl + path;
export class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: options.signal || controller.signal,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        'X-Portfolio-Request': 'cms',
        ...options.headers,
      },
    });
    if (response.status === 204) return null;
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      if (response.status === 401 && path.startsWith('/admin'))
        window.dispatchEvent(new Event('portfolio:session-expired'));
      throw new ApiRequestError(
        body?.error?.message || 'The request could not be completed.',
        response.status,
        body?.error?.details,
      );
    }
    return body.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError(
      error.name === 'AbortError'
        ? 'The request took too long. Please retry.'
        : 'Unable to reach the service. Please try again.',
      0,
    );
  } finally {
    window.clearTimeout(timeout);
  }
}
export const apiClient = {
  detachResume: () => api('/admin/resume/file', { method: 'DELETE' }),
  signup: (values) => api('/auth/signup', { method: 'POST', body: JSON.stringify(values) }),
  adminLogin: (values) =>
    api('/auth/admin/login', { method: 'POST', body: JSON.stringify(values) }),
  googleChallenge: () => api('/auth/google/challenge', { method: 'POST' }),
  google: (credential) =>
    api('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  completeGoogle: (values) =>
    api('/auth/google/complete', { method: 'POST', body: JSON.stringify(values) }),
  put: (resource, values) =>
    api('/admin/' + resource, { method: 'PUT', body: JSON.stringify(values) }),
  uploadResume: (file) => {
    const body = new FormData();
    body.append('file', file);
    return api('/admin/resume/file', { method: 'POST', body });
  },
  resume: () => api('/public/resume'),
  bootstrap: () => api('/public/bootstrap'),
  project: (slug) => api(`/public/projects/${encodeURIComponent(slug)}`),
  page: (slug) => api(`/public/pages/${encodeURIComponent(slug)}`),
  login: (values) => api('/auth/login', { method: 'POST', body: JSON.stringify(values) }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  password: (values) => api('/auth/password', { method: 'PUT', body: JSON.stringify(values) }),
  me: () => api('/auth/me'),
  dashboard: () => api('/admin/dashboard'),
  get: (resource) => api(`/admin/${resource}`),
  save: (resource, values, id) =>
    api(`/admin/${resource}${id ? `/${id}` : ''}`, {
      method: resource === 'profile' || id ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    }),
  remove: (resource, id) => api(`/admin/${resource}/${id}`, { method: 'DELETE' }),
};
