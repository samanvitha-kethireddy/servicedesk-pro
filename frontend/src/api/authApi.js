import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getMe: () => axiosInstance.get('/auth/me'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => axiosInstance.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) =>
    axiosInstance.post('/auth/change-password', { currentPassword, newPassword }),
};