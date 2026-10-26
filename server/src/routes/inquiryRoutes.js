import { Router } from 'express';
import * as inquiries from '../controllers/inquiryController.js';
import authenticate, { optionalAuth } from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { idParam } from '../validators/common.js';
import { createInquirySchema, inquiryQuerySchema, inquiryStatusSchema } from '../validators/miscValidators.js';

const router = Router();

router.post('/', formLimiter, optionalAuth, validate({ body: createInquirySchema }), inquiries.create);
router.get('/mine', authenticate, validate({ query: inquiryQuerySchema }), inquiries.mine);
router.get('/:id', authenticate, validate({ params: idParam }), inquiries.getOne);
router.patch('/:id/status', authenticate, validate({ params: idParam, body: inquiryStatusSchema }), inquiries.updateStatus);

export default router;
