import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fileTypeFromBuffer } from 'file-type';
import env from '../config/env.js';
import cloudinary, { isCloudinaryEnabled } from '../config/cloudinary.js';
import Upload from '../models/Upload.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { ALLOWED_IMAGE_MIME } from '../middleware/upload.js';

export const LOCAL_UPLOAD_DIR = fileURLToPath(new URL('../../uploads', import.meta.url));

/** Inspects the file's magic bytes; the extension and the client-supplied MIME type are not trusted. */
async function assertRealImage(file) {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !ALLOWED_IMAGE_MIME.includes(detected.mime)) {
    throw ApiError.badRequest(`"${file.originalname}" is not a valid JPEG, PNG or WebP image`);
  }
  return detected;
}

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${env.CLOUDINARY_FOLDER}/${folder}`, resource_type: 'image', transformation: [{ width: 2000, crop: 'limit' }] },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });
}

async function storeFile(file, detected, folder) {
  if (isCloudinaryEnabled) {
    const result = await uploadToCloudinary(file.buffer, folder);
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  }
  const name = `${crypto.randomUUID()}.${detected.ext}`;
  await fs.mkdir(path.join(LOCAL_UPLOAD_DIR, folder), { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, folder, name), file.buffer);
  return { url: `/uploads/${folder}/${name}`, publicId: `${folder}/${name}`, provider: 'local' };
}

export async function saveImages(files, user, kind = 'property') {
  if (!files?.length) throw ApiError.badRequest('Please choose at least one image');
  const detected = await Promise.all(files.map(assertRealImage));
  const folder = kind === 'avatar' ? 'avatars' : 'properties';

  const stored = [];
  for (let i = 0; i < files.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const meta = await storeFile(files[i], detected[i], folder);
    stored.push({ ...meta, kind, uploadedBy: user._id, bytes: files[i].size, mimeType: detected[i].mime });
  }
  return Upload.insertMany(stored);
}

/** Removes files from storage and their Upload records. External (seeded) images are left untouched. */
export async function deleteStoredUploads(uploads) {
  for (const upload of uploads) {
    try {
      if (upload.provider === 'cloudinary') {
        // eslint-disable-next-line no-await-in-loop
        await cloudinary.uploader.destroy(upload.publicId);
      } else if (upload.provider === 'local') {
        const filePath = path.resolve(LOCAL_UPLOAD_DIR, upload.publicId);
        if (filePath.startsWith(LOCAL_UPLOAD_DIR)) {
          // eslint-disable-next-line no-await-in-loop
          await fs.rm(filePath, { force: true });
        }
      }
    } catch (err) {
      logger.warn('upload_delete_failed', { uploadId: String(upload._id), error: err.message });
    }
  }
  await Upload.deleteMany({ _id: { $in: uploads.map((u) => u._id) } });
}

/** Deletes uploads after verifying the caller owns them, also detaching them from the owner's listing. */
export async function deleteUserUploads(uploadIds, user) {
  const uploads = await Upload.find({ _id: { $in: uploadIds } });
  if (uploads.length !== uploadIds.length) throw ApiError.notFound('One or more images were not found');

  for (const upload of uploads) {
    const isOwner = String(upload.uploadedBy) === String(user._id);
    if (!isOwner && user.role !== 'admin') throw ApiError.forbidden('You can only delete images you uploaded');
    if (upload.property) {
      // eslint-disable-next-line no-await-in-loop
      const property = await Property.findById(upload.property).select('owner');
      if (property && String(property.owner) !== String(user._id) && user.role !== 'admin') {
        throw ApiError.forbidden('This image belongs to another listing');
      }
    }
  }

  await Property.updateMany({ 'images.upload': { $in: uploadIds } }, { $pull: { images: { upload: { $in: uploadIds } } } });
  await deleteStoredUploads(uploads);
}

/** Removes property images that were uploaded but never attached to a listing within a day. */
export async function cleanupOrphanUploads(maxAgeHours = 24) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  const orphans = await Upload.find({ kind: 'property', property: null, provider: { $ne: 'external' }, createdAt: { $lt: cutoff } }).limit(200);
  if (orphans.length) {
    await deleteStoredUploads(orphans);
    logger.info('orphan_uploads_cleaned', { count: orphans.length });
  }
}
