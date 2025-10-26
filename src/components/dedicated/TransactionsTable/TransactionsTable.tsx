import React, { FC, useMemo } from 'react';
import cx from 'classnames';

import RecordRow from 'components/dedicated/RecordRow/RecordRow';
import Spinner from 'components/core/Spinner/Spinner';

import styles from './TransactionsTable.module.scss';
import { useTransactions } from 'application/hooks/useTransactions';
import { sortByDate } from 'utils/sortTransactions';

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

const TransactionsTable: FC = () => {
  const { data, isLoading, isError, error } = useTransactions();
  const [newTransactionId, setNewTransactionId] = React.useState<string | null>(
    null,
  );
  const previousFirstIdRef = React.useRef<string | null>(null);

  // Re execute it only if the data we receive from the API changes
  const processedTransactions = useMemo(() => {
    if (!data) return null;

    const sorted = sortByDate(data, 'desc');
    return sorted;
  }, [data]);

  // Track the first transaction ID to detect new additions
  React.useEffect(() => {
    if (!processedTransactions || processedTransactions.length === 0) return;

    const firstTransaction = processedTransactions[0];
    const previousFirstTransactionId = previousFirstIdRef.current;

    previousFirstIdRef.current = firstTransaction.id;

    // Only trigger highlight if we had a previous ID and it changed
    if (
      !previousFirstTransactionId ||
      previousFirstTransactionId === firstTransaction.id
    )
      return;

    setNewTransactionId(firstTransaction.id);

    const timeout = setTimeout(() => {
      setNewTransactionId(null);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [processedTransactions]);

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

      {/* Error state */}
      {isError && (
        <div className={cx(styles.container, containerStyles.error)}>
          <p className={styles.errorMessage}>
            {error?.message || 'Unable to fetch data. Please try again later.'}
          </p>
        </div>
      )}

      {/* Success state - render transactions */}
      {processedTransactions && processedTransactions.length > 0 && (
        <>
          {processedTransactions.map((transaction) => (
            <RecordRow
              key={transaction.id}
              columnStyles={columnStyles}
              transactionRecord={transaction}
              isNewlyAdded={transaction.id === newTransactionId}
            />
          ))}
        </>
      )}

      {/* Empty state */}
      {processedTransactions && processedTransactions.length === 0 && (
        <div className={cx(styles.container, containerStyles.empty)}>
          <p>No transactions found.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
