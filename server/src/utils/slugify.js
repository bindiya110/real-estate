import crypto from 'node:crypto';

export function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Generates a slug that is unique for the given model, appending a short suffix on collision. */
export async function uniqueSlug(Model, text, excludeId) {
  const base = slugify(text) || 'item';
  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const exists = await Model.exists(filter);
    if (!exists) return candidate;
    candidate = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
