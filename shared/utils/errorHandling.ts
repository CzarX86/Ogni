export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
  field?: string;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`External service error: ${service} - ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle Firebase errors
    if (error.message.includes('permission-denied')) {
      return new AuthorizationError('Access denied');
    }
    if (error.message.includes('not-found')) {
      return new NotFoundError();
    }
    if (error.message.includes('already-exists')) {
      return new ConflictError('Resource already exists');
    }

    // Handle network errors
    if (error.message.includes('network-request-failed')) {
      return new ExternalServiceError('Firebase', 'Network request failed');
    }

    return new AppError(error.message);
  }

  return new AppError('An unknown error occurred');
}

export function logError(error: AppError, context?: Record<string, any>): void {
  const logData = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  if (error.isOperational) {
    console.warn('Operational Error:', logData);
  } else {
    console.error('Programming Error:', logData);
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTracking(logData);
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error);
      logError(appError, { args });
      throw appError;
    }
  };
}