import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const reservationsAPI = {
  create: (data) => api.post('/reservations', data),
  getMy: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  remove: (id) => api.delete(`/tables/${id}`),
};

export const adminAPI = {
  getReservations: (params) => api.get('/admin/reservations', { params }),
  updateReservation: (id, data) => api.put(`/admin/reservations/${id}`, data),
  cancelReservation: (id) => api.patch(`/admin/reservations/${id}/cancel`),
};
