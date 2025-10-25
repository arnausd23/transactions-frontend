import { TransactionRecord } from 'store/types';

/**
 * Sorts transactions by date
 * @param transactions - Array of transaction records
 * @param order - Sort order: 'asc' for ascending (oldest first), 'desc' for descending (newest first)
 * @returns Sorted array of transactions
 */
export const sortByDate = (
  transactions: TransactionRecord[],
  order: 'asc' | 'desc' = 'desc',
): TransactionRecord[] => {
  return [...transactions].sort((a, b) => {
    return order === 'desc'
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp;
  });
};
