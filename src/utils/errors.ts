/**
 * Error Handling Utilities
 *
 * Custom error classes and error handling helpers for Okta API.
 */

/**
 * Base Okta API error
 */
export class OktaApiError extends Error {
  public statusCode?: number;
  public code: string;
  public retryable: boolean;
  public errorId?: string;
  public errorCauses?: Array<{ errorSummary: string }>;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    retryable = false,
    errorId?: string,
    errorCauses?: Array<{ errorSummary: string }>
  ) {
    super(message);
    this.name = 'OktaApiError';
    this.statusCode = statusCode;
    this.code = code || 'OKTA_ERROR';
    this.retryable = retryable;
    this.errorId = errorId;
    this.errorCauses = errorCauses;
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends OktaApiError {
  public retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends OktaApiError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_FAILED', false);
    this.name = 'AuthenticationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends OktaApiError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with ID '${id}' not found`, 404, 'NOT_FOUND', false);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends OktaApiError {
  public details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof OktaApiError) {
    return error.retryable;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET')
    );
  }
  return false;
}

/**
 * Format an error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof OktaApiError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      errorId: error.errorId,
      errorCauses: error.errorCauses,
      ...(error instanceof RateLimitError && { retryAfterSeconds: error.retryAfterSeconds }),
      ...(error instanceof ValidationError && { details: error.details }),
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}
