import { Feature, Code, ErrorCode } from "../config/error.config";

/**
 * Base application error class with typed error codes
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly feature: Feature;
  public readonly errorType: Code;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    feature: Feature,
    errorType: Code,
    statusCode: number,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.feature = feature;
    this.errorType = errorType;
    this.code = `${feature}:${errorType}` as ErrorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid input or missing required fields
 */
export class BadRequestError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "bad-request", 400);
    this.name = "BadRequestError";
  }
}

/**
 * 400 Validation Error - Schema validation failed
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    feature: Feature,
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, feature, "validation", 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "unauthorized", 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "forbidden", 403);
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "not-found", 404);
    this.name = "NotFoundError";
  }
}

/**
 * 409 Conflict - Resource already exists or conflicting state
 */
export class ConflictError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "conflict", 409);
    this.name = "ConflictError";
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "too-many-requests", 429);
    this.name = "TooManyRequestsError";
  }
}

/**
 * 408 Timeout - Request timeout
 */
export class TimeoutError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "timeout", 408);
    this.name = "TimeoutError";
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalError extends AppError {
  constructor(message: string, feature: Feature) {
    super(message, feature, "internal", 500, false);
    this.name = "InternalError";
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Get HTTP status code from any error
 */
export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  message: string;
  code?: ErrorCode;
  errors?: Array<{ field: string; message: string }>;
} {
  if (isValidationError(error)) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      errors: error.errors,
    };
  }

  if (isAppError(error)) {
    return {
      success: false,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: false,
    message: "An unexpected error occurred",
  };
}
