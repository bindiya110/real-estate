import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

export const isCloudinaryEnabled =
  env.UPLOAD_MODE === 'cloudinary' &&
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;
