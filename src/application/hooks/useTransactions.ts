/**
 * Application Layer - Custom Hooks
 * React Query hook for fetching transactions
 */

import { useQuery } from '@tanstack/react-query';
import { Transaction, TransactionDTO } from 'domain/entities/Transaction';
import { fetchAPI } from 'infrastructure/api/fetchAPI';
import { TRANSACTIONS_QUERY_KEY } from './types';

export const useTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetchAPI({ url: '/api/transactions' });

      return response.map((dto: TransactionDTO) => Transaction.fromApi(dto));
    },
    refetchInterval: 5000,
  });
};
