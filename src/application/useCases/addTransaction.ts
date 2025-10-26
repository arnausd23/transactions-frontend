/**
 * Application Layer - Use Case
 * Handles the business logic for adding a new transaction
 */

import { Transaction } from '../../domain/entities/Transaction';
import { fetchAPI } from '../../infrastructure/api/fetchAPI';
import { convertMainUnitToSubunit } from '../../utils/currency';

/**
 * Input data for creating a new transaction
 * Accepts raw form data that will be parsed and validated by the domain
 */
export interface AddTransactionInput {
  amount: string | number;
  payee: string;
  timestamp: string | number;
  memo?: string;
}

/**
 * Use case: Add a new transaction from raw input data
 *
 * This use case:
 * 1. Parses and transforms raw input data
 * 2. Creates and validates a Transaction entity
 * 3. Sends the data to the API
 * 4. Returns the created transaction from the API response
 *
 * @param input - Raw transaction data to be added
 * @returns Promise<Transaction> - The created transaction entity
 * @throws Error if validation, parsing fails, or API request fails
 */
export const addTransaction = async (
  input: AddTransactionInput,
): Promise<Transaction> => {
  // Parse amount from dollars to cents (subunits)
  const parsedAmount =
    typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;

  if (isNaN(parsedAmount)) {
    throw new Error('Amount must be a valid number');
  }
  const amountInCents = convertMainUnitToSubunit(parsedAmount);

  // Parse timestamp
  let parsedTimestamp: number;
  if (!input.timestamp) {
    throw new Error('Timestamp is required');
  }

  if (typeof input.timestamp === 'string') {
    const date = new Date(input.timestamp);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD HH:mm');
    }
    parsedTimestamp = date.getTime();
  } else {
    parsedTimestamp = input.timestamp;
  }

  const transaction = Transaction.create(
    input.payee,
    amountInCents,
    parsedTimestamp,
    input.memo,
  );

  const payload = transaction.toApi();

  const response = await fetchAPI({
    url: '/api/transactions',
    method: 'POST',
    body: payload,
  });

  return Transaction.fromApi(response);
};
