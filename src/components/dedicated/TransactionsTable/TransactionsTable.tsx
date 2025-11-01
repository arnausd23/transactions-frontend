import React, { FC, useEffect, useState } from 'react';
import cx from 'classnames';

import RecordRow from 'components/dedicated/RecordRow/RecordRow';
import Spinner from 'components/core/Spinner/Spinner';
import Pagination from 'components/core/Pagination/Pagination';
import ErrorMessage from 'components/core/ErrorMessage/ErrorMessage';

import styles from './TransactionsTable.module.scss';
import spinnerStyles from 'components/core/Spinner/Spinner.module.scss';
import { usePaginatedTransactions } from 'hooks/usePaginatedTransactions';
import { useTransactions } from 'hooks/useTransactions';

export const columnStyles = {
  amount: styles['column--amount'],
  payee: styles['column--payee'],
  date: styles['column--date'],
  memo: styles['column--memo'],
};

interface TransactionsTableProps {
  onNavigateToTransaction?: (goToTransactionPage: (id: string) => void) => void;
  newTransactionId?: string | null;
}

const TransactionsTable: FC<TransactionsTableProps> = ({
  onNavigateToTransaction,
  newTransactionId: externalNewTransactionId,
}) => {
  const {
    transactions,
    pagination,
    isLoading,
    isError,
    error,
    isFetching,
    goToNextPage,
    goToPreviousPage,
    goToTransactionPage,
  } = usePaginatedTransactions();

  const { refetch } = useTransactions();

  const [highlightedTransactionId, setHighlightedTransactionId] = useState<
    string | null
  >(null);

  // Expose navigation function to parent
  useEffect(() => {
    if (onNavigateToTransaction) {
      onNavigateToTransaction(goToTransactionPage);
    }
  }, [onNavigateToTransaction, goToTransactionPage]);

  // Handle highlighting for newly added transactions
  useEffect(() => {
    if (externalNewTransactionId) {
      setHighlightedTransactionId(externalNewTransactionId);

      const timeout = setTimeout(() => {
        setHighlightedTransactionId(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [externalNewTransactionId]);

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className={styles.root}>
      <div className={styles.tableHeader}>
        <div className={cx(styles.column, columnStyles.date)}>Date</div>
        <div className={cx(styles.column, columnStyles.payee)}>Payee</div>
        <div className={cx(styles.column, columnStyles.memo)}>Memo</div>
        <div className={cx(styles.column, columnStyles.amount)}>Amount</div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className={styles.container}>
          <Spinner size={3} />
          <p className={styles.loadingMessage}>Loading transactions...</p>
        </div>
      )}

      {/* Show refresh indicator when fetching but not initial load */}
      {isFetching && !isLoading && (
        <div className={styles.refreshingRow}>
          <Spinner size={2} className={spinnerStyles['spinner--cyan']} />
          <p className={styles.refreshingMessage}>Refreshing transactions...</p>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className={styles.errorContainer}>
          <ErrorMessage
            error={error}
            onRetry={handleRetry}
            showRetry={true}
          />
        </div>
      )}

      {/* Success state - render transactions */}
      {!isLoading && !isError && transactions && transactions.length > 0 && (
        <>
          {transactions.map((transaction) => (
            <RecordRow
              key={transaction.id}
              columnStyles={columnStyles}
              transactionRecord={transaction}
              isNewlyAdded={transaction.id === highlightedTransactionId}
            />
          ))}
        </>
      )}

      {/* Empty state */}
      {!isLoading && !isError && transactions && transactions.length === 0 && (
        <div className={styles.emptyContainer}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className={styles.emptyMessage}>No transactions found</p>
          <p className={styles.emptySubmessage}>
            Add your first transaction using the form below
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading &&
        !isError &&
        pagination &&
        transactions &&
        transactions.length > 0 && (
          <Pagination
            pagination={pagination}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onGoToPage={() => {}}
          />
        )}
    </div>
  );
};

export default TransactionsTable;
