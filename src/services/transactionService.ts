import { Transaction, CreateTransactionPayload } from '../types/transaction';
import { FetchAPIOptions } from '../types/api';
import { convertMainUnitToSubunit } from '../utils/currency';
import { normalizeError, getUserFriendlyMessage } from '../utils/errorHandling';
import { createAPIError, createNetworkError } from '../types/errors';

const DEFAULT_URL = '/api/transactions';

/**
 * Enhanced API fetch function with better error handling
 */
async function fetchAPI<T = any>(options: FetchAPIOptions = {}): Promise<T> {
  const { url = DEFAULT_URL, method = 'GET', body, headers = {} } = options;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch data';

      try {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw createAPIError(errorMessage, response.status, response.statusText);
    }

    return response.json();
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw createNetworkError(
        'Network error. Please check your connection and try again.',
        error,
      );
    }

    // Handle other errors
    const message = getUserFriendlyMessage(error);
    throw createNetworkError(
      message,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Transaction Service
 * Centralized service for all transaction-related operations
 */
export const transactionService = {
  /**
   * Fetch all transactions from the API
   */
  async fetchTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetchAPI<Transaction[]>({
        url: DEFAULT_URL,
        method: 'GET',
      });

      // Validate and normalize the response
      if (!Array.isArray(response)) {
        throw new Error('Invalid response format: expected an array');
      }

      return response;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Create a new transaction
   * @param input - Transaction input data (will be validated and transformed)
   */
  async createTransaction(input: {
    amount: string | number;
    payee: string;
    timestamp: string | number;
    memo?: string;
  }): Promise<Transaction> {
    try {
      // Validate and parse amount
      const parsedAmount =
        typeof input.amount === 'string'
          ? parseFloat(input.amount)
          : input.amount;

      if (isNaN(parsedAmount)) {
        throw createAPIError('Amount must be a valid number', 400);
      }

      const amountInCents = convertMainUnitToSubunit(parsedAmount);

      // Validate and parse timestamp
      let parsedTimestamp: number;
      if (!input.timestamp) {
        throw createAPIError('Timestamp is required', 400);
      }

      if (typeof input.timestamp === 'string') {
        const date = new Date(input.timestamp);
        if (isNaN(date.getTime())) {
          throw createAPIError(
            'Invalid date format. Please use YYYY-MM-DD HH:mm format.',
            400,
          );
        }
        parsedTimestamp = date.getTime();
      } else {
        parsedTimestamp = input.timestamp;
      }

      // Validate payee
      if (!input.payee || input.payee.trim().length === 0) {
        throw createAPIError('Payee is required', 400);
      }

      // Prepare payload
      const payload: CreateTransactionPayload = {
        amount: amountInCents,
        payee: input.payee.trim(),
        timestamp: parsedTimestamp,
        ...(input.memo && input.memo.trim() && { memo: input.memo.trim() }),
      };

      // Make API call
      const response = await fetchAPI<Transaction>({
        url: DEFAULT_URL,
        method: 'POST',
        body: payload,
      });

      return response;
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
