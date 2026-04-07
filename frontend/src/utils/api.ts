import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Canvas API
export const canvasApi = {
  getAll: () => api.get('/canvases'),
  get: (id: string) => api.get(`/canvases/${id}`),
  create: (data: Partial<import('@/types').Canvas>) =>
    api.post('/canvases', data),
  update: (id: string, data: Partial<import('@/types').Canvas>) =>
    api.patch(`/canvases/${id}`, data),
  delete: (id: string) => api.delete(`/canvases/${id}`),
};

// Object API
export const objectApi = {
  create: (canvasId: string, data: Partial<import('@/types').CanvasObject>) =>
    api.post(`/canvases/${canvasId}/objects`, data),
  update: (canvasId: string, objectId: string, data: Partial<import('@/types').CanvasObject>) =>
    api.patch(`/canvases/${canvasId}/objects/${objectId}`, data),
  delete: (canvasId: string, objectId: string) =>
    api.delete(`/canvases/${canvasId}/objects/${objectId}`),
  bulkUpdate: (canvasId: string, data: {
    creates?: Partial<import('@/types').CanvasObject>[];
    updates?: { id: string; updates: Partial<import('@/types').CanvasObject> }[];
    deletes?: string[];
  }) => api.post(`/canvases/${canvasId}/objects/bulk`, data),
};

// Export API
export const exportApi = {
  toPng: (canvasId: string, params?: { width?: number; height?: number; bg?: string }) =>
    api.get(`/export/${canvasId}/png`, { params, responseType: 'blob' }),
  toExcalidraw: (canvasId: string) =>
    api.get(`/export/${canvasId}/excalidraw`),
  toJson: (canvasId: string) =>
    api.get(`/export/${canvasId}/json`),
};
