import { Router } from 'express';
import * as users from '../controllers/userController.js';
import * as inquiries from '../controllers/inquiryController.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { uploadAvatar } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { changePasswordSchema, updateProfileSchema } from '../validators/authValidators.js';
import { myPropertiesQuerySchema } from '../validators/propertyValidators.js';
import { inquiryQuerySchema } from '../validators/miscValidators.js';

const router = Router();

router.use(authenticate);
router.get('/me', users.getMe);
router.patch('/me', validate({ body: updateProfileSchema }), users.updateMe);
router.post('/me/avatar', uploadLimiter, uploadAvatar, users.uploadAvatar);
router.patch('/me/password', validate({ body: changePasswordSchema }), users.changePassword);
router.get('/me/properties', validate({ query: myPropertiesQuerySchema }), users.myProperties);
router.get('/me/stats', users.myStats);
router.get('/me/inquiries', validate({ query: inquiryQuerySchema }), inquiries.mine);

export default router;
