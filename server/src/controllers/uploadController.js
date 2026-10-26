import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { deleteUserUploads, saveImages } from '../services/uploadService.js';

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const uploads = await saveImages(req.files, req.user, 'property');
  sendSuccess(res, {
    status: 201,
    data: uploads.map((u) => ({ _id: u._id, url: u.url, provider: u.provider })),
    message: `${uploads.length} image${uploads.length > 1 ? 's' : ''} uploaded`,
  });
});

export const deletePropertyImages = asyncHandler(async (req, res) => {
  await deleteUserUploads(req.body.uploadIds, req.user);
  sendSuccess(res, { message: 'Image removed' });
});
