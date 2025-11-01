import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import { TRANSACTIONS_QUERY_KEY } from './types';

export interface AddTransactionInput {
  amount: string | number;
  payee: string;
  timestamp: string | number;
  memo?: string;
}

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
 */
export const useAddTransaction = (): UseAddTransactionResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Transaction, Error, AddTransactionInput>({
    mutationFn: async (input) => {
      return transactionService.createTransaction(input);
    },
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

