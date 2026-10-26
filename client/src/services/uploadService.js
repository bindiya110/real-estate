import api, { unwrap } from './api';

export const uploadService = {
  /** Uploads images and reports progress as a 0-100 percentage. */
  propertyImages: (files, onProgress) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return unwrap(
      api.post('/uploads/property-images', form, {
        timeout: 120_000,
        onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      }),
    );
  },
  deletePropertyImages: (uploadIds) => unwrap(api.delete('/uploads/property-images', { data: { uploadIds } })),
};

export default uploadService;
