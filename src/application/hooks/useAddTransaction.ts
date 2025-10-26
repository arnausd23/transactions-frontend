/**
 * Application Layer - Custom Hook
 * React Query mutation hook for adding transactions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addTransaction,
  AddTransactionInput,
} from '../useCases/addTransaction';
import { Transaction } from 'domain/entities/Transaction';
import { TRANSACTIONS_QUERY_KEY } from './types';

/**
 * Hook for adding a new transaction
 *
 * Provides mutation function and state for adding transactions.
 * Automatically invalidates and refetches the transactions list on success.
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, isError, etc.
 *
 */
export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, AddTransactionInput>({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
    },
  });
};
