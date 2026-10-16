import { API_BASE_URL } from '../config/env';

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * PLACEHOLDER — return auth headers once the backend decides on auth.
 * e.g. return { Authorization: `Bearer ${getToken()}` };
 */
function getAuthHeaders() {
  return {};
}

function buildUrl(path, params) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/** GET JSON with query params, abort support and normalised errors. */
export async function apiGet(path, params, { signal } = {}) {
  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: { Accept: 'application/json', ...getAuthHeaders() },
      credentials: 'include',
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Check your connection.', { status: 0 });
  }

  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const message = (body && body.message) || `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, body });
  }
  return body;
}
