import axios from 'axios';

// Defaults to the relative "/api" so requests go through the Vite dev-server
// proxy (see vite.config.js + VITE_BACKEND_ORIGIN in .env) instead of hitting
// the backend's absolute URL directly from the browser. The backend sends no
// CORS headers, so a direct cross-origin call (e.g. localhost:5173 ->
// localhost:8000) fails before this code ever runs. Routing through the
// proxy keeps every request same-origin, which sidesteps CORS entirely.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

// The backend has no authentication middleware today (api/auth.js is empty
// and unmounted), so there is no token to attach. This interceptor is kept
// in place so that wiring up a real Authorization header later is a
// one-line change, not a rewrite.
api.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(normalizeError(error));
  }
);

function getStoredSession() {
  try {
    const raw = localStorage.getItem('stackenzo_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Every route in this backend hand-rolls its own error shape, but they are
 * all consistent enough to normalize down to: { status, message, data }
 */
export function normalizeError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const message =
      data?.message ||
      (status === 404
        ? 'No matching records were found'
        : status === 401
          ? 'You are not authorized. Please sign in again.'
          : status === 403
            ? "You don't have permission to do this."
            : status === 409
              ? 'This already exists.'
              : status >= 500
                ? 'Something went wrong on the server. Please try again.'
                : 'The request could not be completed.');

    return { status, message, data: data?.data ?? null, isApiError: true };
  }

  if (error.request) {
    return {
      status: 0,
      message: 'Could not reach the server. Check your connection or the API URL.',
      isApiError: true
    };
  }

  return { status: -1, message: error.message || 'Unexpected error', isApiError: true };
}

/**
 * Normalizes the many response shapes this backend returns into a plain
 * array. GET endpoints return 404 with no `data` when a list is empty —
 * callers should catch that and treat it as an empty list, not a crash.
 */
export function extractList(payload, ...possibleKeys) {
  const keys = possibleKeys.length ? possibleKeys : ['data'];
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

export function extractItem(payload, ...possibleKeys) {
  const keys = possibleKeys.length ? possibleKeys : ['data'];
  for (const key of keys) {
    if (payload?.[key] !== undefined) return payload[key];
  }
  return null;
}

/**
 * Wraps a GET call so that the backend's "404 = empty result" convention
 * becomes a normal empty array instead of a thrown error.
 */
export async function getListOrEmpty(promise, ...keys) {
  try {
    const response = await promise;
    return extractList(response.data, ...keys);
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

export default api;
