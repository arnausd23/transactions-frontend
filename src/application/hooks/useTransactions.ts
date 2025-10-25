/**
 * Application Layer - Custom Hooks
 * React Query hook for fetching transactions
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from 'infrastructure/api/fetchAPI';
import { TransactionRecord } from 'store/types';

type TransactionsResponse = {
  transactions: TransactionRecord[];
};

export const useTransactions = () => {
  return useQuery<TransactionsResponse, Error>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetchAPI({ url: '/api/transactions' });
      return response;
    },
    refetchInterval: 5000, // Refetch every 5 seconds as per requirement
  });
};
