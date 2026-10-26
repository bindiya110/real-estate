import api, { unwrap } from './api';

export const userService = {
  me: () => unwrap(api.get('/users/me')),
  updateProfile: (payload) => unwrap(api.patch('/users/me', payload)),
  changePassword: (payload) => unwrap(api.patch('/users/me/password', payload)),
  myProperties: (params) => unwrap(api.get('/users/me/properties', { params })),
  stats: () => unwrap(api.get('/users/me/stats')),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return unwrap(api.post('/users/me/avatar', form));
  },
};

export default userService;
