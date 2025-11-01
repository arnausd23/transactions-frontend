import { useQuery } from '@tanstack/react-query';
import { Transaction } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import { TRANSACTIONS_QUERY_KEY } from './types';

export const useTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      return transactionService.fetchTransactions();
    },
    refetchInterval: 5000,
    retry: (failureCount, error) => {
      // Don't retry on validation errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
};

