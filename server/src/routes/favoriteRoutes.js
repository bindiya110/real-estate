import { Router } from 'express';
import { z } from 'zod';
import * as favorites from '../controllers/favoriteController.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { objectId } from '../validators/common.js';

const router = Router();
const params = z.object({ propertyId: objectId });

router.use(authenticate);
router.get('/', favorites.list);
router.get('/ids', favorites.ids);
router.post('/:propertyId', validate({ params }), favorites.add);
router.delete('/:propertyId', validate({ params }), favorites.remove);

export default router;
