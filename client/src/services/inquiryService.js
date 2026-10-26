import api, { unwrap } from './api';

export const inquiryService = {
  create: (payload) => unwrap(api.post('/inquiries', payload)),
  mine: (params) => unwrap(api.get('/users/me/inquiries', { params })),
  get: (id) => unwrap(api.get(`/inquiries/${id}`)),
  updateStatus: (id, status) => unwrap(api.patch(`/inquiries/${id}/status`, { status })),
};

export default inquiryService;
