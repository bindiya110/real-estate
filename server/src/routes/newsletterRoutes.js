import { Router } from 'express';
import * as newsletter from '../controllers/newsletterController.js';
import validate from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { newsletterSchema } from '../validators/miscValidators.js';

const router = Router();

router.post('/subscribe', formLimiter, validate({ body: newsletterSchema }), newsletter.subscribe);
router.post('/unsubscribe', formLimiter, validate({ body: newsletterSchema }), newsletter.unsubscribe);

export default router;
