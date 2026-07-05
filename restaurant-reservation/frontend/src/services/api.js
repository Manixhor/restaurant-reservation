import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

export const reservationsAPI = {
  create: (data) => api.post('/reservations', data),
  getMine: () => api.get('/reservations/mine'),
  cancelMine: (id) => api.patch(`/reservations/${id}/cancel`),
  getAll: (params) => api.get('/reservations/all', { params }),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  cancel: (id) => api.patch(`/reservations/${id}/admin-cancel`),
  checkAvailability: (params) => api.get('/reservations/availability', { params }),
};

export default api;
