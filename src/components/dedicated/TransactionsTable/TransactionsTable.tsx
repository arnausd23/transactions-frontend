import React, { FC, useEffect, useState } from 'react';
import cx from 'classnames';

import RecordRow from 'components/dedicated/RecordRow/RecordRow';
import Spinner from 'components/core/Spinner/Spinner';
import Pagination from 'components/core/Pagination/Pagination';

import styles from './TransactionsTable.module.scss';
import spinnerStyles from 'components/core/Spinner/Spinner.module.scss';
import { usePaginatedTransactions } from 'application/hooks/usePaginatedTransactions';

export const columnStyles = {
  amount: styles['column--amount'],
  payee: styles['column--payee'],
  date: styles['column--date'],
  memo: styles['column--memo'],
};

const containerStyles = {
  error: styles['container--error'],
  empty: styles['container--empty'],
};

const refreshingRowStyles = {
  refreshingRow: styles['refreshing-row'],
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
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [externalNewTransactionId]);

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
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Show refresh indicator as a loading row when fetching but not initial load */}
      {isFetching && !isLoading && (
        <div className={refreshingRowStyles.refreshingRow}>
          <Spinner size={3} className={spinnerStyles['spinner--cyan']} />
          <p>Refreshing transactions...</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className={cx(styles.container, containerStyles.error)}>
          <p className={styles.errorMessage}>
            {error?.message || 'Unable to fetch data. Please try again later.'}
          </p>
        </div>
      )}

      {/* Success state - render transactions */}
      {transactions && transactions.length > 0 && (
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
      {transactions && transactions.length === 0 && (
        <div className={cx(styles.container, containerStyles.empty)}>
          <p>No transactions found.</p>
        </div>
      )}

      {/* Pagination controls */}
      {pagination && transactions && transactions.length > 0 && (
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
