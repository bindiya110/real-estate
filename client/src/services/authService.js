import api, { unwrap } from './api';

export const authService = {
  me: () => unwrap(api.get('/auth/me')),
  login: (credentials) => unwrap(api.post('/auth/login', credentials)),
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  logout: () => unwrap(api.post('/auth/logout')),
  forgotPassword: (email) => unwrap(api.post('/auth/forgot-password', { email })),
  resetPassword: (token, password) => unwrap(api.post('/auth/reset-password', { token, password })),
  verifyEmail: (token) => unwrap(api.post('/auth/verify-email', { token })),
  resendVerification: () => unwrap(api.post('/auth/resend-verification')),
};

export default authService;
