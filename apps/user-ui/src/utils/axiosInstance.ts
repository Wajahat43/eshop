import axios from 'axios';
import { runRedirectToLogin } from './redirect';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const { pathname, search } = window.location;
  const currentPath = pathname;
  const pathWithSearch = `${pathname}${search}`;

  if (!publicPaths.some((path) => currentPath.startsWith(path))) {
    runRedirectToLogin(pathWithSearch);
  }
};

//Handle adding a new access token to queued request.
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued request after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

//Handle api requests
axiosInstance.interceptors.request.use(
  (config) => {
    const headers = config.headers ?? {};
    (headers as any)['x-auth-actor'] = 'user';
    config.headers = headers;

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired token and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const isRetry = originalRequest._retry;
    const isAuthRequired = originalRequest.requireAuth;

    //Prevent infinite loop
    if (is401 && !isRetry && isAuthRequired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`, {}, { withCredentials: true });
        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
