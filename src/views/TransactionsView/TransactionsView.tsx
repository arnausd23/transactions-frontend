import React, { ReactElement, useState, useCallback, useRef } from 'react';

import AddRecordForm from 'components/dedicated/AddRecordForm/AddRecordForm';
import TransactionsTable from 'components/dedicated/TransactionsTable/TransactionsTable';

import styles from './TransactionsView.module.scss';

const TransactionsView = (): ReactElement => {
  const goToTransactionPageRef = useRef<((id: string) => void) | null>(null);
  const [newTransactionId, setNewTransactionId] = useState<string | null>(null);

  const handleNavigateToTransaction = useCallback(
    (navigateFn: (id: string) => void) => {
      goToTransactionPageRef.current = navigateFn;
    },
    [],
  );

  const handleTransactionAdded = useCallback((transactionId: string) => {
    setNewTransactionId(transactionId);

    // Use a small delay to ensure the ref has been updated
    setTimeout(() => {
      if (goToTransactionPageRef.current) {
        goToTransactionPageRef.current(transactionId);
      } else {
        console.log('goToTransactionPageRef.current is null');
      }
    }, 100);
  }, []);

  return (
    <div className={styles.root}>
      <TransactionsTable
        onNavigateToTransaction={handleNavigateToTransaction}
        newTransactionId={newTransactionId}
      />
      <AddRecordForm onTransactionAdded={handleTransactionAdded} />
    </div>
  );
};

export default TransactionsView;
