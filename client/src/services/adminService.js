import api, { unwrap } from './api';

export const adminService = {
  dashboard: () => unwrap(api.get('/admin/dashboard')),

  properties: (params) => unwrap(api.get('/admin/properties', { params })),
  property: (id) => unwrap(api.get(`/admin/properties/${id}`)),
  updateProperty: (id, payload) => unwrap(api.patch(`/admin/properties/${id}`, payload)),
  approve: (id) => unwrap(api.patch(`/admin/properties/${id}/approve`)),
  reject: (id, reason) => unwrap(api.patch(`/admin/properties/${id}/reject`, { reason })),
  feature: (id, featured) => unwrap(api.patch(`/admin/properties/${id}/feature`, { featured })),
  setStatus: (id, payload) => unwrap(api.patch(`/admin/properties/${id}/status`, payload)),
  deleteProperty: (id) => unwrap(api.delete(`/admin/properties/${id}`)),

  users: (params) => unwrap(api.get('/admin/users', { params })),
  user: (id) => unwrap(api.get(`/admin/users/${id}`)),
  changeRole: (id, role) => unwrap(api.patch(`/admin/users/${id}/role`, { role })),
  changeUserStatus: (id, isActive) => unwrap(api.patch(`/admin/users/${id}/status`, { isActive })),

  inquiries: (params) => unwrap(api.get('/admin/inquiries', { params })),
  updateInquiryStatus: (id, status) => unwrap(api.patch(`/admin/inquiries/${id}/status`, { status })),
  deleteInquiry: (id) => unwrap(api.delete(`/admin/inquiries/${id}`)),

  messages: (params) => unwrap(api.get('/admin/messages', { params })),
  updateMessageStatus: (id, status) => unwrap(api.patch(`/admin/messages/${id}/status`, { status })),
  deleteMessage: (id) => unwrap(api.delete(`/admin/messages/${id}`)),

  categories: () => unwrap(api.get('/admin/categories')),
  createCategory: (payload) => unwrap(api.post('/admin/categories', payload)),
  updateCategory: (id, payload) => unwrap(api.patch(`/admin/categories/${id}`, payload)),
  deleteCategory: (id) => unwrap(api.delete(`/admin/categories/${id}`)),

  testimonials: () => unwrap(api.get('/admin/testimonials')),
  createTestimonial: (payload) => unwrap(api.post('/admin/testimonials', payload)),
  updateTestimonial: (id, payload) => unwrap(api.patch(`/admin/testimonials/${id}`, payload)),
  deleteTestimonial: (id) => unwrap(api.delete(`/admin/testimonials/${id}`)),

  subscribers: (params) => unwrap(api.get('/admin/newsletter', { params })),
  deleteSubscriber: (id) => unwrap(api.delete(`/admin/newsletter/${id}`)),

  settings: () => unwrap(api.get('/admin/settings')),
  updateSettings: (payload) => unwrap(api.patch('/admin/settings', payload)),
};

export default adminService;
