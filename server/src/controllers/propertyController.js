import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as propertyService from '../services/propertyService.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await propertyService.searchProperties(req.valid.query);
  sendSuccess(res, { data: items, meta });
});

export const featured = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 6);
  sendSuccess(res, { data: await propertyService.listPublic({ featured: true, limit }) });
});

export const latest = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 8);
  const listingType = ['sale', 'rent'].includes(req.query.listingType) ? req.query.listingType : undefined;
  sendSuccess(res, { data: await propertyService.listPublic({ limit, listingType }) });
});

export const locations = asyncHandler(async (_req, res) => {
  sendSuccess(res, { data: await propertyService.popularLocations() });
});

export const getById = asyncHandler(async (req, res) => {
  const property = await propertyService.getVisibleProperty({ _id: req.valid.params.id }, req.user);
  sendSuccess(res, { data: property });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const property = await propertyService.getVisibleProperty({ slug: req.valid.params.slug }, req.user);
  sendSuccess(res, { data: property });
});

export const similar = asyncHandler(async (req, res) => {
  const property = await propertyService.getVisibleProperty({ _id: req.valid.params.id }, null);
  sendSuccess(res, { data: await propertyService.similarProperties(property) });
});

export const create = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user);
  const message = {
    draft: 'Draft saved',
    pending: 'Listing submitted for approval',
    approved: 'Listing published',
  }[property.status];
  sendSuccess(res, { status: 201, data: property, message });
});

export const update = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(req.valid.params.id, req.body, req.user);
  const message = property.status === 'draft' ? 'Draft saved' : property.status === 'pending' ? 'Listing updated and sent for review' : 'Listing updated';
  sendSuccess(res, { data: property, message });
});

export const remove = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.valid.params.id, req.user);
  sendSuccess(res, { message: 'Listing deleted' });
});
