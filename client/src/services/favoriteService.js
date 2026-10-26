import api, { unwrap } from './api';

export const favoriteService = {
  list: (params) => unwrap(api.get('/favorites', { params })),
  ids: () => unwrap(api.get('/favorites/ids')),
  add: (propertyId) => unwrap(api.post(`/favorites/${propertyId}`)),
  remove: (propertyId) => unwrap(api.delete(`/favorites/${propertyId}`)),
};

export default favoriteService;
