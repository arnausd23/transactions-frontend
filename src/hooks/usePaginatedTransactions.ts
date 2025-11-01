import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTransactions } from './useTransactions';
import { Transaction } from '../types/transaction';
import { Pagination } from '../types/pagination';
import { paginateItems, findItemPage } from '../utils/pagination';
import { sortByDate } from '../utils/sortTransactions';

const ITEMS_PER_PAGE = 10;

export interface UsePaginatedTransactionsResult {
  transactions: Transaction[] | null;
  pagination: Pagination | null;
  allTransactions: Transaction[] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToTransactionPage: (transactionId: string) => void;
}

export const usePaginatedTransactions = (): UsePaginatedTransactionsResult => {
  const { data, isLoading, isError, error, isFetching } = useTransactions();
  const [currentPage, setCurrentPage] = useState(1);

  const sortedTransactions = useMemo(() => {
    if (!data) return null;
    return sortByDate(data, 'desc');
  }, [data]);

  // Paginate the sorted transactions
  const paginatedResult = useMemo(() => {
    if (!sortedTransactions) return null;
    return paginateItems(sortedTransactions, currentPage, ITEMS_PER_PAGE);
  }, [sortedTransactions, currentPage]);

  // Reset to page 1 when transactions change (e.g., after refetch)
  useEffect(() => {
    if (sortedTransactions && currentPage > 1) {
      const maxPage = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE) || 1;
      if (currentPage > maxPage) {
        setCurrentPage(1);
      }
    }
  }, [sortedTransactions, currentPage]);

  // Navigate to a specific page
  const goToPage = useCallback(
    (page: number) => {
      if (!paginatedResult) return;
      const { pagination } = paginatedResult;

      if (page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
      }
    },
    [paginatedResult],
  );

  // Navigate to the next page
  const goToNextPage = useCallback(() => {
    if (paginatedResult?.pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginatedResult]);

  // Navigate to the previous page
  const goToPreviousPage = useCallback(() => {
    if (paginatedResult?.pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [paginatedResult]);

  // Navigate to the page containing a specific transaction
  const goToTransactionPage = useCallback(
    (transactionId: string) => {
      if (!sortedTransactions) {
        return;
      }

      const page = findItemPage(sortedTransactions, transactionId, ITEMS_PER_PAGE);
      setCurrentPage(page);
    },
    [sortedTransactions],
  );

  return {
    transactions: paginatedResult?.items ?? null,
    pagination: paginatedResult?.pagination ?? null,
    allTransactions: sortedTransactions,
    isLoading,
    isError,
    error,
    isFetching,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToTransactionPage,
  };
};

