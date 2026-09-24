import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getSummary: () => axiosInstance.get('/dashboard/summary'),
  getRecentTickets: (limit) => axiosInstance.get('/dashboard/recent-tickets', { params: { limit } }),
  getSLATrend: (days) => axiosInstance.get('/dashboard/sla-trend', { params: { days } }),
};