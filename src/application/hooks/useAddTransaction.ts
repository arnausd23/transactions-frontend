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

export interface UseAddTransactionResult {
  mutate: (input: AddTransactionInput) => void;
  mutateAsync: (input: AddTransactionInput) => Promise<Transaction>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: Transaction | undefined;
  reset: () => void;
}

/**
 * Hook for adding a new transaction
 *
 * Provides mutation function and state for adding transactions.
 * Automatically invalidates and refetches the transactions list on success.
 * Returns the newly created transaction with its ID.
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, isError, data (containing new transaction), etc.
 *
 */
export const useAddTransaction = (): UseAddTransactionResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Transaction, Error, AddTransactionInput>({
    mutationFn: addTransaction,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
