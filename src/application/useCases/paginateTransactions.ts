/**
 * Application Use Case: Paginate Transactions
 * Contains business logic for paginating transaction lists
 */
import { Transaction } from '../../domain/entities/Transaction';
import { Pagination } from '../../domain/valueObjects/Pagination';

/**
 * Result of a paginated query
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

/**
 * Paginates a list of transactions
 *
 * @param transactions - Full list of transactions (should be pre-sorted)
 * @param currentPage - Current page number (1-based)
 * @param itemsPerPage - Number of items to show per page (default: 10)
 * @returns Paginated result with items and pagination metadata
 */
export const paginateTransactions = (
  transactions: Transaction[],
  currentPage: number,
  itemsPerPage: number = 10,
): PaginatedResult<Transaction> => {
  const pagination = Pagination.create(
    currentPage,
    itemsPerPage,
    transactions.length,
  );

  const items = transactions.slice(pagination.startIndex, pagination.endIndex);

  return {
    items,
    pagination,
  };
};

/**
 * Calculates which page a specific transaction would be on
 * Useful for navigating to a newly added transaction
 *
 * @param transactions - Full list of transactions (should be pre-sorted in the same order as displayed)
 * @param transactionId - ID of the transaction to find
 * @param itemsPerPage - Number of items per page (default: 10)
 * @returns Page number (1-based) where the transaction is located, or 1 if not found
 */
export const findTransactionPage = (
  transactions: Transaction[],
  transactionId: string,
  itemsPerPage: number = 10,
): number => {
  const index = transactions.findIndex((t) => t.id === transactionId);
  if (index === -1) return 1;

  return Math.floor(index / itemsPerPage) + 1;
};
