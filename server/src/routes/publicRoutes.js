import { Router } from 'express';
import * as pub from '../controllers/publicController.js';
import { optionalAuth } from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { formLimiter } from '../middleware/rateLimiter.js';
import { idParam } from '../validators/common.js';
import { agentQuerySchema, contactSchema } from '../validators/miscValidators.js';

const router = Router();

router.get('/agents', validate({ query: agentQuerySchema }), pub.listAgents);
router.get('/agents/featured', pub.featuredAgents);
router.get('/agents/:id', validate({ params: idParam }), pub.getAgent);
router.post('/contact', formLimiter, optionalAuth, validate({ body: contactSchema }), pub.contact);
router.get('/settings', pub.getSettings);
router.get('/stats', pub.stats);

export default router;
