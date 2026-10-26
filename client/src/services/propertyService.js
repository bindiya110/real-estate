import api, { unwrap } from './api';

export const propertyService = {
  search: (params) => unwrap(api.get('/properties', { params })),
  featured: (limit = 6) => unwrap(api.get('/properties/featured', { params: { limit } })),
  latest: (limit = 8, listingType) => unwrap(api.get('/properties/latest', { params: { limit, listingType } })),
  locations: () => unwrap(api.get('/properties/locations')),
  bySlug: (slug) => unwrap(api.get(`/properties/slug/${encodeURIComponent(slug)}`)),
  byId: (id) => unwrap(api.get(`/properties/${id}`)),
  similar: (id) => unwrap(api.get(`/properties/${id}/similar`)),
  create: (payload) => unwrap(api.post('/properties', payload)),
  update: (id, payload) => unwrap(api.patch(`/properties/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/properties/${id}`)),
};

export default propertyService;
