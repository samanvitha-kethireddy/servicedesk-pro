import axiosInstance from './axiosInstance';

export const kbApi = {
  create: (data) => axiosInstance.post('/kb', data),
  getAll: (params) => axiosInstance.get('/kb', { params }),
  getOne: (idOrSlug) => axiosInstance.get(`/kb/${idOrSlug}`),
  update: (id, data) => axiosInstance.patch(`/kb/${id}`, data),
  submitFeedback: (id, isHelpful) => axiosInstance.post(`/kb/${id}/feedback`, { isHelpful }),
  delete: (id) => axiosInstance.delete(`/kb/${id}`),
};