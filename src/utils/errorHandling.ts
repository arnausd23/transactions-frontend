import {
  ErrorType,
  NetworkError,
  ValidationError,
  APIError,
  createNetworkError,
  createValidationError,
  createAPIError,
} from '../types/errors';

/**
 * Parse and format errors into user-friendly messages
 */
export const parseError = (error: unknown): { message: string; type: ErrorType } => {
  // Handle our custom error types
  if (error && typeof error === 'object') {
    if ('type' in error) {
      const appError = error as NetworkError | ValidationError | APIError;
      return { message: appError.message, type: appError.type };
    }

    // Handle APIError-like objects
    if ('status' in error) {
      const apiError = error as { status: number; statusText?: string; message?: string };
      const status = apiError.status;
      
      if (status === 400) {
        return { message: apiError.message || 'Invalid request. Please check your input.', type: ErrorType.VALIDATION };
      }
      if (status === 401) {
        return { message: 'You are not authorized. Please sign in.', type: ErrorType.API };
      }
      if (status === 403) {
        return { message: 'You do not have permission to perform this action.', type: ErrorType.API };
      }
      if (status === 404) {
        return { message: 'The requested resource was not found.', type: ErrorType.API };
      }
      if (status === 429) {
        return { message: 'Too many requests. Please try again in a moment.', type: ErrorType.API };
      }
      if (status >= 500) {
        return { message: 'Server error. Please try again later.', type: ErrorType.API };
      }
      
      return { message: apiError.message || 'An error occurred. Please try again.', type: ErrorType.API };
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    // Check for network-related errors
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return {
        message: 'Network error. Please check your connection and try again.',
        type: ErrorType.NETWORK,
      };
    }
    
    return { message: error.message, type: ErrorType.UNKNOWN };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error, type: ErrorType.UNKNOWN };
  }

  // Fallback
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: ErrorType.UNKNOWN,
  };
};

/**
 * Convert any error to AppError format
 */
export const normalizeError = (error: unknown): NetworkError | ValidationError | APIError => {
  const parsed = parseError(error);
  
  switch (parsed.type) {
    case ErrorType.NETWORK:
      return createNetworkError(parsed.message, error instanceof Error ? error : undefined);
    case ErrorType.VALIDATION:
      return createValidationError(parsed.message);
    case ErrorType.API:
      const apiError = error as { status?: number; statusText?: string };
      return createAPIError(parsed.message, apiError.status || 500, apiError.statusText);
    default:
      return createNetworkError(parsed.message, error instanceof Error ? error : undefined);
  }
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  return parseError(error).message;
};

