import axiosInstance from './axiosInstance';

export const ticketApi = {
  create: (data) => axiosInstance.post('/tickets', data),
  getAll: (params) => axiosInstance.get('/tickets', { params }),
  getById: (id) => axiosInstance.get(`/tickets/${id}`),
  update: (id, data) => axiosInstance.patch(`/tickets/${id}`, data),
  changeStatus: (id, status, note) => axiosInstance.patch(`/tickets/${id}/status`, { status, note }),
  assign: (id, assignedTo) => axiosInstance.patch(`/tickets/${id}/assign`, { assignedTo }),
  toggleWatch: (id) => axiosInstance.post(`/tickets/${id}/watch`),
  submitAIFeedback: (id, wasAccepted) => axiosInstance.post(`/tickets/${id}/ai-feedback`, { wasAccepted }),
  delete: (id) => axiosInstance.delete(`/tickets/${id}`),

  addComment: (ticketId, message, isInternal) =>
    axiosInstance.post(`/tickets/${ticketId}/comments`, { message, isInternal }),
  getComments: (ticketId) => axiosInstance.get(`/tickets/${ticketId}/comments`),
  updateComment: (id, message) => axiosInstance.patch(`/comments/${id}`, { message }),
  deleteComment: (id) => axiosInstance.delete(`/comments/${id}`),

  classifyPreview: (title, description) => axiosInstance.post('/ai/classify', { title, description }),
  recommendKBPreview: (title, description, category) =>
    axiosInstance.post('/ai/recommend-kb', { title, description, category }),
};