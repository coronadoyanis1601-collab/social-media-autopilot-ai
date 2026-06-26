import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE, timeout: 60000 });

export const contentsAPI = {
  getAll: (params?: any) => api.get('/contents', { params }),
  getOne: (id: string) => api.get(`/contents/${id}`),
  create: (data: any) => api.post('/contents', data),
  update: (id: string, data: any) => api.patch(`/contents/${id}`, data),
  delete: (id: string) => api.delete(`/contents/${id}`),
  analyze: (id: string) => api.post(`/contents/${id}/analyze`),
  getDashboard: () => api.get('/contents/stats/dashboard'),
};

export const postsAPI = {
  getAll: (params?: any) => api.get('/posts', { params }),
  getOne: (id: string) => api.get(`/posts/${id}`),
  update: (id: string, data: any) => api.patch(`/posts/${id}`, data),
  generate: (content_id: string, platforms: string[]) => api.post('/posts/generate', { content_id, platforms }),
  regenerate: (id: string) => api.post(`/posts/${id}/regenerate`),
};

export const analyticsAPI = {
  getAll: (params?: any) => api.get('/analytics', { params }),
  create: (data: any) => api.post('/analytics', data),
  update: (id: string, data: any) => api.patch(`/analytics/${id}`, data),
};

export const brandAPI = {
  get: () => api.get('/brand'),
  save: (data: any) => api.post('/brand', data),
};

export const ideasAPI = {
  getAll: (params?: any) => api.get('/ideas', { params }),
  create: (data: any) => api.post('/ideas', data),
  update: (id: string, data: any) => api.patch(`/ideas/${id}`, data),
  delete: (id: string) => api.delete(`/ideas/${id}`),
};

export const aiAPI = {
  getOptimalTimes: (platform?: string) => api.get('/ai/optimal-times', { params: { platform } }),
};

export default api;
