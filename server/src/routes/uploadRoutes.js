import { Router } from 'express';
import * as uploads from '../controllers/uploadController.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { uploadPropertyImages } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { deleteUploadsSchema } from '../validators/miscValidators.js';

const router = Router();

router.use(authenticate);
router.post('/property-images', uploadLimiter, uploadPropertyImages, uploads.uploadPropertyImages);
router.delete('/property-images', validate({ body: deleteUploadsSchema }), uploads.deletePropertyImages);

export default router;
