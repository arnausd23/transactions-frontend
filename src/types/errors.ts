/**
 * Error types for better error handling
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Base error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: Record<string, any>;
}

/**
 * Network error - occurs when there's a network issue (offline, timeout, etc.)
 */
export interface NetworkError extends AppError {
  type: ErrorType.NETWORK;
  originalError?: Error;
}

/**
 * Validation error - occurs when input validation fails
 */
export interface ValidationError extends AppError {
  type: ErrorType.VALIDATION;
  field?: string;
}

/**
 * API error - occurs when API returns an error response
 */
export interface APIError extends AppError {
  type: ErrorType.API;
  status: number;
  statusText?: string;
}

/**
 * Create a network error
 */
export const createNetworkError = (
  message: string,
  originalError?: Error,
): NetworkError => ({
  type: ErrorType.NETWORK,
  message,
  originalError,
});

/**
 * Create a validation error
 */
export const createValidationError = (
  message: string,
  field?: string,
): ValidationError => ({
  type: ErrorType.VALIDATION,
  message,
  field,
});

/**
 * Create an API error
 */
export const createAPIError = (
  message: string,
  status: number,
  statusText?: string,
): APIError => ({
  type: ErrorType.API,
  message,
  status,
  statusText,
});

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): error is NetworkError => {
  return error?.type === ErrorType.NETWORK;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): error is ValidationError => {
  return error?.type === ErrorType.VALIDATION;
};

/**
 * Check if error is an API error
 */
export const isAPIError = (error: any): error is APIError => {
  return error?.type === ErrorType.API;
};

