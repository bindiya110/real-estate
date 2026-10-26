import ApiError from '../utils/ApiError.js';

const formatIssues = (issues) => issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));

/**
 * Validates request parts with Zod schemas. Unknown keys are stripped by the schemas, which
 * prevents mass assignment. Parsed values are exposed on req.body and req.valid.{query,params}.
 */
const validate = ({ body, query, params } = {}) => (req, _res, next) => {
  req.valid = req.valid || {};
  const parts = [
    ['params', params, req.params],
    ['query', query, req.query],
    ['body', body, req.body ?? {}],
  ];

  for (const [key, schema, value] of parts) {
    if (!schema) continue;
    const result = schema.safeParse(value);
    if (!result.success) return next(ApiError.badRequest('Validation failed', formatIssues(result.error.issues)));
    if (key === 'body') req.body = result.data;
    req.valid[key] = result.data;
  }
  return next();
};

export default validate;
