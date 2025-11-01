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
  amount: styles['transactions-table__column--amount'],
  payee: styles['transactions-table__column--payee'],
  date: styles['transactions-table__column--date'],
  memo: styles['transactions-table__column--memo'],
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
    goToPage,
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
    <>
      {/* Show refresh indicator when fetching but not initial load - outside the table */}
      {isFetching && !isLoading && (
        <div className={styles['transactions-table__container--loading']}>
          <Spinner size={2} className={spinnerStyles['spinner--cyan']} />
          <p className={styles['transactions-table__message--loading']}>
            Refreshing transactions...
          </p>
        </div>
      )}

      <div className={styles['transactions-table']}>
        <div className={styles['transactions-table__header']}>
          <div
            className={cx(
              styles['transactions-table__column'],
              styles['transactions-table__column-header'],
              columnStyles.date,
            )}
          >
            Date
          </div>
          <div
            className={cx(
              styles['transactions-table__column'],
              styles['transactions-table__column-header'],
              columnStyles.payee,
            )}
          >
            Payee
          </div>
          <div
            className={cx(
              styles['transactions-table__column'],
              styles['transactions-table__column-header'],
              columnStyles.memo,
            )}
          >
            Memo
          </div>
          <div
            className={cx(
              styles['transactions-table__column'],
              styles['transactions-table__column-header'],
              columnStyles.amount,
            )}
          >
            Amount
          </div>
        </div>

        <div className={styles['transactions-table__body']}>
          {/* Initial loading state - inside the table */}
          {isLoading && (
            <div
              className={styles['transactions-table__container--refreshing']}
            >
              <Spinner size={3} />
              <p className={styles['transactions-table__message--refreshing']}>
                Loading transactions...
              </p>
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className={styles['transactions-table__container--error']}>
              <ErrorMessage
                error={error}
                onRetry={handleRetry}
                showRetry={true}
              />
            </div>
          )}

          {/* Success state - render transactions */}
          {!isLoading &&
            !isError &&
            transactions &&
            transactions.length > 0 && (
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
          {!isLoading &&
            !isError &&
            transactions &&
            transactions.length === 0 && (
              <div className={styles['transactions-table__container--empty']}>
                <svg
                  className={styles['transactions-table__icon--empty']}
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
                <p className={styles['transactions-table__message--empty']}>
                  No transactions found
                </p>
                <p className={styles['transactions-table__submessage--empty']}>
                  Add your first transaction using the form below
                </p>
              </div>
            )}
        </div>

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
              onGoToPage={goToPage}
            />
          )}
      </div>
    </>
  );
};

export default TransactionsTable;
