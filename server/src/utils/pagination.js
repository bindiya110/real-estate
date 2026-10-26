export const MAX_LIMIT = 48;

export function getPagination({ page = 1, limit = 12 } = {}, maxLimit = MAX_LIMIT) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(maxLimit, Math.max(1, Number.parseInt(limit, 10) || 12));
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function buildMeta(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
}

export async function paginate(Model, filter, { page, limit, skip }, { sort = { createdAt: -1 }, select, populate, lean = true } = {}) {
  let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  if (lean) query = query.lean({ virtuals: true });
  const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
  return { items, meta: buildMeta(total, page, limit) };
}
