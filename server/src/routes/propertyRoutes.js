import { Router } from 'express';
import * as properties from '../controllers/propertyController.js';
import authenticate, { optionalAuth } from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import {
  createPropertySchema, propertyQuerySchema, slugParam, updatePropertySchema,
} from '../validators/propertyValidators.js';

const router = Router();

// Slugs live under /slug/:slug so they can never be confused with ObjectIds at /:id.
router.get('/', validate({ query: propertyQuerySchema }), properties.list);
router.get('/featured', properties.featured);
router.get('/latest', properties.latest);
router.get('/locations', properties.locations);
router.get('/slug/:slug', optionalAuth, validate({ params: slugParam }), properties.getBySlug);
router.get('/:id', optionalAuth, validate({ params: idParam }), properties.getById);
router.get('/:id/similar', validate({ params: idParam }), properties.similar);

router.post('/', authenticate, validate({ body: createPropertySchema }), properties.create);
router.patch('/:id', authenticate, validate({ params: idParam, body: updatePropertySchema }), properties.update);
router.delete('/:id', authenticate, validate({ params: idParam }), properties.remove);

export default router;
