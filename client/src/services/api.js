import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/** The one Axios instance used by every service. Auth lives in HttpOnly cookies, never in JS. */
const api = axios.create({ baseURL, withCredentials: true, timeout: 30_000 });

// A bare instance for token endpoints so they never trigger the interceptors below recursively.
const raw = axios.create({ baseURL, withCredentials: true, timeout: 15_000 });

let csrfToken = null;
let csrfPromise = null;

export function fetchCsrfToken(force = false) {
  if (csrfToken && !force) return Promise.resolve(csrfToken);
  if (!csrfPromise) {
    csrfPromise = raw
      .get('/auth/csrf')
      .then((res) => {
        csrfToken = res.data.data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

const SAFE_METHODS = ['get', 'head', 'options'];

api.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.includes((config.method || 'get').toLowerCase())) {
    config.headers['X-CSRF-Token'] = await fetchCsrfToken();
  }
  return config;
});

// Concurrent 401s share a single refresh request.
let refreshPromise = null;
let onSessionExpired = () => {};

export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetchCsrfToken()
      .then((token) => raw.post('/auth/refresh', null, { headers: { 'X-CSRF-Token': token } }))
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!config || !response) return Promise.reject(error);
    const code = response.data?.code;

    if (response.status === 403 && code === 'CSRF_INVALID' && !config._csrfRetry) {
      config._csrfRetry = true;
      config.headers['X-CSRF-Token'] = await fetchCsrfToken(true);
      return api(config);
    }

    if (response.status === 401 && code === 'TOKEN_EXPIRED' && !config._authRetry) {
      config._authRetry = true;
      try {
        await refreshSession();
        return api(config);
      } catch (refreshError) {
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Human-readable message from an API error (or a generic fallback). */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : (error.message || fallback);
  return error.response.data?.message || fallback;
}

/** Field-level errors from a 400 validation response: { fieldName: message }. */
export function getFieldErrors(error) {
  const list = error?.response?.data?.errors || [];
  return Object.fromEntries(list.filter((e) => e.field).map((e) => [e.field, e.message]));
}

/** Returns the parsed body ({ success, data, meta, message }). */
export const unwrap = (promise) => promise.then((res) => res.data);

export default api;
