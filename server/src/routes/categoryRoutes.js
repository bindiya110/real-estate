import { Router } from 'express';
import * as categories from '../controllers/categoryController.js';

const router = Router();

router.get('/', categories.listPublic);

export default router;
