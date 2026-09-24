import axiosInstance from './axiosInstance';

export const departmentApi = {
  getAll: () => axiosInstance.get('/departments'),
  create: (data) => axiosInstance.post('/departments', data),
  update: (id, data) => axiosInstance.patch(`/departments/${id}`, data),
  delete: (id) => axiosInstance.delete(`/departments/${id}`),
};