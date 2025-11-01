import {
  parseError,
  normalizeError,
  getUserFriendlyMessage,
} from './errorHandling';
import {
  ErrorType,
  createNetworkError,
  createValidationError,
  createAPIError,
} from '../types/errors';

describe('errorHandling', () => {
  describe('parseError', () => {
    describe('custom error types', () => {
      it('should parse NetworkError', () => {
        const error = createNetworkError('Network failed');
        const result = parseError(error);

        expect(result.message).toBe('Network failed');
        expect(result.type).toBe(ErrorType.NETWORK);
      });

      it('should parse ValidationError', () => {
        const error = createValidationError('Invalid input');
        const result = parseError(error);

        expect(result.message).toBe('Invalid input');
        expect(result.type).toBe(ErrorType.VALIDATION);
      });

      it('should parse APIError', () => {
        const error = createAPIError('Server error', 500);
        const result = parseError(error);

        expect(result.message).toBe('Server error');
        expect(result.type).toBe(ErrorType.API);
      });
    });

    describe('HTTP status codes', () => {
      it('should handle 400 Bad Request', () => {
        const error = { status: 400, message: 'Bad request' };
        const result = parseError(error);

        expect(result.message).toBe('Bad request');
        expect(result.type).toBe(ErrorType.VALIDATION);
      });

      it('should handle 400 with default message', () => {
        const error = { status: 400 };
        const result = parseError(error);

        expect(result.message).toBe(
          'Invalid request. Please check your input.',
        );
        expect(result.type).toBe(ErrorType.VALIDATION);
      });

      it('should handle 401 Unauthorized', () => {
        const error = { status: 401 };
        const result = parseError(error);

        expect(result.message).toBe('You are not authorized. Please sign in.');
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle 403 Forbidden', () => {
        const error = { status: 403 };
        const result = parseError(error);

        expect(result.message).toBe(
          'You do not have permission to perform this action.',
        );
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle 404 Not Found', () => {
        const error = { status: 404 };
        const result = parseError(error);

        expect(result.message).toBe('The requested resource was not found.');
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle 429 Too Many Requests', () => {
        const error = { status: 429 };
        const result = parseError(error);

        expect(result.message).toBe(
          'Too many requests. Please try again in a moment.',
        );
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle 500 Internal Server Error', () => {
        const error = { status: 500 };
        const result = parseError(error);

        expect(result.message).toBe('Server error. Please try again later.');
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle 503 Service Unavailable', () => {
        const error = { status: 503 };
        const result = parseError(error);

        expect(result.message).toBe('Server error. Please try again later.');
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle other status codes with custom message', () => {
        const error = { status: 418, message: "I'm a teapot" };
        const result = parseError(error);

        expect(result.message).toBe("I'm a teapot");
        expect(result.type).toBe(ErrorType.API);
      });

      it('should handle other status codes with default message', () => {
        const error = { status: 418 };
        const result = parseError(error);

        expect(result.message).toBe('An error occurred. Please try again.');
        expect(result.type).toBe(ErrorType.API);
      });
    });

    describe('Error instances', () => {
      it('should detect network errors from error message', () => {
        const error = new Error('Failed to fetch');
        const result = parseError(error);

        expect(result.message).toBe(
          'Network error. Please check your connection and try again.',
        );
        expect(result.type).toBe(ErrorType.NETWORK);
      });

      it('should detect network errors with "network" in message', () => {
        const error = new Error('network timeout');
        const result = parseError(error);

        expect(result.type).toBe(ErrorType.NETWORK);
      });

      it('should detect network errors with "fetch" in message', () => {
        const error = new Error('fetch failed');
        const result = parseError(error);

        expect(result.type).toBe(ErrorType.NETWORK);
      });

      it('should handle generic Error instances', () => {
        const error = new Error('Something went wrong');
        const result = parseError(error);

        expect(result.message).toBe('Something went wrong');
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });
    });

    describe('string errors', () => {
      it('should handle string errors', () => {
        const error = 'A simple error message';
        const result = parseError(error);

        expect(result.message).toBe('A simple error message');
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });
    });

    describe('unknown errors', () => {
      it('should handle null', () => {
        const result = parseError(null);

        expect(result.message).toBe(
          'An unexpected error occurred. Please try again.',
        );
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });

      it('should handle undefined', () => {
        const result = parseError(undefined);

        expect(result.message).toBe(
          'An unexpected error occurred. Please try again.',
        );
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });

      it('should handle number', () => {
        const result = parseError(123);

        expect(result.message).toBe(
          'An unexpected error occurred. Please try again.',
        );
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });

      it('should handle plain object', () => {
        const result = parseError({ foo: 'bar' });

        expect(result.message).toBe(
          'An unexpected error occurred. Please try again.',
        );
        expect(result.type).toBe(ErrorType.UNKNOWN);
      });
    });
  });

  describe('normalizeError', () => {
    it('should normalize network error', () => {
      const error = new Error('Failed to fetch');
      const result = normalizeError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.message).toContain('Network error');
    });

    it('should normalize validation error', () => {
      const error = { status: 400, message: 'Invalid data' };
      const result = normalizeError(error);

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.message).toBe('Invalid data');
    });

    it('should normalize API error with status', () => {
      const error = { status: 404, statusText: 'Not Found' };
      const result = normalizeError(error);

      expect(result.type).toBe(ErrorType.API);
      expect(result).toHaveProperty('status', 404);
      expect(result).toHaveProperty('statusText', 'Not Found');
    });

    it('should normalize API error with default status', () => {
      const error = 'Server error';
      const result = normalizeError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
    });

    it('should preserve original error in network errors', () => {
      const originalError = new Error('Original error');
      const result = normalizeError(originalError);

      expect(result).toHaveProperty('originalError', originalError);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should extract message from NetworkError', () => {
      const error = createNetworkError('Connection failed');
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Connection failed');
    });

    it('should extract message from ValidationError', () => {
      const error = createValidationError('Field is required');
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Field is required');
    });

    it('should extract message from APIError', () => {
      const error = createAPIError('Resource not found', 404);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Resource not found');
    });

    it('should extract message from Error instance', () => {
      const error = new Error('Generic error');
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Generic error');
    });

    it('should extract message from string error', () => {
      const message = getUserFriendlyMessage('Simple string error');

      expect(message).toBe('Simple string error');
    });

    it('should provide default message for unknown errors', () => {
      const message = getUserFriendlyMessage(null);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle 404 status', () => {
      const error = { status: 404 };
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('The requested resource was not found.');
    });

    it('should handle 500 status', () => {
      const error = { status: 500 };
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Server error. Please try again later.');
    });
  });
});
