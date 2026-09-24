import axiosInstance from './axiosInstance';

export const userApi = {
  getAll: (params) => axiosInstance.get('/users', { params }),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  create: (data) => axiosInstance.post('/users', data),
  update: (id, data) => axiosInstance.patch(`/users/${id}`, data),
  deactivate: (id) => axiosInstance.patch(`/users/${id}/deactivate`),
  reactivate: (id) => axiosInstance.patch(`/users/${id}/reactivate`),
  delete: (id) => axiosInstance.delete(`/users/${id}`),
  getTechnicians: (department) => axiosInstance.get('/users/technicians', { params: { department } }),
};