import axiosInstance from './axiosInstance';

export const assetApi = {
  create: (data) => axiosInstance.post('/assets', data),
  getAll: (params) => axiosInstance.get('/assets', { params }),
  getById: (id) => axiosInstance.get(`/assets/${id}`),
  update: (id, data) => axiosInstance.patch(`/assets/${id}`, data),
  assign: (id, data) => axiosInstance.post(`/assets/${id}/assign`, data),
  returnAsset: (id, data) => axiosInstance.post(`/assets/${id}/return`, data),
  retire: (id, status) => axiosInstance.patch(`/assets/${id}/retire`, { status }),
  delete: (id) => axiosInstance.delete(`/assets/${id}`),
};