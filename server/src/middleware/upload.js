import multer from 'multer';
import ApiError from '../utils/ApiError.js';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_REQUEST = 10;
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];

// Files stay in memory so their real content can be inspected before anything is stored.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES_PER_REQUEST, fields: 10 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPEG, PNG and WebP images are allowed'));
    }
    return cb(null, true);
  },
});

export const uploadPropertyImages = upload.array('images', MAX_IMAGES_PER_REQUEST);
export const uploadAvatar = upload.single('avatar');

export default upload;
