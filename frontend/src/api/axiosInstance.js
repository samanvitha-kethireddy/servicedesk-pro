import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('sdp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';
    const requestUrl = error.config?.url || '';

    const isAuthCheckCall = requestUrl.includes('/auth/me');

    if (status === 401 && !isAuthCheckCall) {
      localStorage.removeItem('sdp_token');
      const publicPaths = ['/login', '/register'];
      const onPublicPath = publicPaths.some((p) => window.location.pathname.includes(p));
      if (!onPublicPath) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(message || 'You do not have permission to do that');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;