import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import * as categories from '../controllers/categoryController.js';
import * as testimonials from '../controllers/testimonialController.js';
import * as newsletter from '../controllers/newsletterController.js';
import * as inquiries from '../controllers/inquiryController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import {
  adminPropertyQuerySchema, featurePropertySchema, propertyStatusSchema, rejectPropertySchema, updatePropertySchema,
} from '../validators/propertyValidators.js';
import {
  adminInquiryQuerySchema, adminUserQuerySchema, categorySchema, contactStatusSchema, inquiryStatusSchema,
  listQuerySchema, roleSchema, settingsSchema, testimonialSchema, userStatusSchema,
} from '../validators/miscValidators.js';

const router = Router();

// Every admin endpoint requires a verified session AND the admin role from the database.
router.use(authenticate, authorize('admin'));

router.get('/dashboard', admin.dashboard);

router.get('/properties', validate({ query: adminPropertyQuerySchema }), admin.listProperties);
router.get('/properties/:id', validate({ params: idParam }), admin.getProperty);
router.patch('/properties/:id', validate({ params: idParam, body: updatePropertySchema }), admin.editProperty);
router.patch('/properties/:id/approve', validate({ params: idParam }), admin.approveProperty);
router.patch('/properties/:id/reject', validate({ params: idParam, body: rejectPropertySchema }), admin.rejectProperty);
router.patch('/properties/:id/feature', validate({ params: idParam, body: featurePropertySchema }), admin.featureProperty);
router.patch('/properties/:id/status', validate({ params: idParam, body: propertyStatusSchema }), admin.updatePropertyStatus);
router.delete('/properties/:id', validate({ params: idParam }), admin.removeProperty);

router.get('/users', validate({ query: adminUserQuerySchema }), admin.listUsers);
router.get('/users/:id', validate({ params: idParam }), admin.getUser);
router.patch('/users/:id/role', validate({ params: idParam, body: roleSchema }), admin.changeRole);
router.patch('/users/:id/status', validate({ params: idParam, body: userStatusSchema }), admin.changeStatus);

router.get('/inquiries', validate({ query: adminInquiryQuerySchema }), admin.listInquiries);
router.patch('/inquiries/:id/status', validate({ params: idParam, body: inquiryStatusSchema }), inquiries.updateStatus);
router.delete('/inquiries/:id', validate({ params: idParam }), admin.deleteInquiry);

router.get('/messages', admin.listMessages);
router.patch('/messages/:id/status', validate({ params: idParam, body: contactStatusSchema }), admin.updateMessageStatus);
router.delete('/messages/:id', validate({ params: idParam }), admin.deleteMessage);

router.get('/categories', categories.listAll);
router.post('/categories', validate({ body: categorySchema }), categories.create);
router.patch('/categories/:id', validate({ params: idParam, body: categorySchema.partial() }), categories.update);
router.delete('/categories/:id', validate({ params: idParam }), categories.remove);

router.get('/testimonials', testimonials.listAll);
router.post('/testimonials', validate({ body: testimonialSchema }), testimonials.create);
router.patch('/testimonials/:id', validate({ params: idParam, body: testimonialSchema.partial() }), testimonials.update);
router.delete('/testimonials/:id', validate({ params: idParam }), testimonials.remove);

router.get('/newsletter', validate({ query: listQuerySchema }), newsletter.listAll);
router.delete('/newsletter/:id', validate({ params: idParam }), newsletter.remove);

router.get('/settings', admin.getSettings);
router.patch('/settings', validate({ body: settingsSchema }), admin.updateSettings);

export default router;
