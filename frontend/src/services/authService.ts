import api from './api';

export const authApi = {
  register: (payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }) =>
    api.post('/auth/register', payload),
  login: (payload: { email?: string; phone?: string; password: string }) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload: { name?: string; phone?: string; avatar?: string }) => api.put('/auth/profile', payload),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
    api.put('/auth/change-password', payload),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, payload: { password: string; confirmPassword: string }) =>
    api.post(`/auth/reset-password/${token}`, payload),
};
