export default class ApiError extends Error {
  constructor(statusCode, message, { errors = [], code } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    this.isOperational = true;
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, { errors });
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHENTICATED') {
    return new ApiError(401, message, { code });
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message, { code: 'CONFLICT' });
  }
}
