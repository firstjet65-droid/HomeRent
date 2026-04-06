import axios from 'axios';

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return '/api';
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '/api';
  }

  if (trimmedValue.startsWith('/')) {
    const normalizedPath = trimmedValue.replace(/\/+$/, '');
    return normalizedPath.endsWith('/api') ? normalizedPath : `${normalizedPath}/api`;
  }

  try {
    const url = new URL(trimmedValue);
    const normalizedPath = url.pathname.replace(/\/+$/, '');

    if (!normalizedPath || normalizedPath === '/') {
      url.pathname = '/api';
    } else if (!normalizedPath.endsWith('/api')) {
      url.pathname = `${normalizedPath}/api`;
    }

    return url.toString().replace(/\/+$/, '');
  } catch {
    const normalizedValue = trimmedValue.replace(/\/+$/, '');
    return normalizedValue.endsWith('/api') ? normalizedValue : `${normalizedValue}/api`;
  }
};

const configuredApiUrl = import.meta.env.VITE_API_URL;
const baseURL = normalizeApiBaseUrl(configuredApiUrl);

if (import.meta.env.PROD && !configuredApiUrl) {
  console.warn('VITE_API_URL is not set. Falling back to /api. If frontend and backend are deployed separately, set VITE_API_URL to your backend Render URL.');
}

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { baseURL as apiBaseURL };
export default api;
