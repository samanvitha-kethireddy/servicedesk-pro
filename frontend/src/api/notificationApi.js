import axiosInstance from './axiosInstance';

export const notificationApi = {
  getAll: (limit) => axiosInstance.get('/notifications', { params: { limit } }),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch('/notifications/read-all'),
};