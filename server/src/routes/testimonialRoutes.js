import { Router } from 'express';
import * as testimonials from '../controllers/testimonialController.js';

const router = Router();

router.get('/', testimonials.listPublic);

export default router;
