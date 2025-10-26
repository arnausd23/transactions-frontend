import React, { FC, useState, FormEvent } from 'react';
import cx from 'classnames';

import { columnStyles } from 'components/dedicated/TransactionsTable/TransactionsTable';
import Button from 'components/core/Button/Button';
import { useAddTransaction } from 'application/hooks/useAddTransaction';

import styles from './AddRecordForm.module.scss';

const AddRecordForm: FC = () => {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useAddTransaction();

  const clearForm = () => {
    setPayee('');
    setAmount('');
    setMemo('');
    setDate('');
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Submit transaction - parsing and validation will happen in the use case layer
    mutate(
      {
        payee: payee.trim(),
        amount: amount,
        timestamp: date.trim() || undefined,
        memo: memo.trim() || undefined,
      },
      {
        onSuccess: () => {
          clearForm();
        },
        onError: (err) => {
          setError(err.message || 'Failed to add transaction');
        },
      },
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>Add record</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.fields}>
          <div className={cx(styles.column, columnStyles.date)}>
            <input
              placeholder="YYYY-MM-DD HH:mm (optional)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              aria-label="Date in YYYY-MM-DD HH:mm format"
            />
          </div>
          <div className={cx(styles.column, columnStyles.payee)}>
            <input
              placeholder="Payee *"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              disabled={isPending}
              required
              aria-label="Payee"
            />
          </div>
          <div className={cx(styles.column, columnStyles.memo)}>
            <input
              placeholder="Memo (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isPending}
              aria-label="Memo"
            />
          </div>
          <div
            className={cx(
              styles.column,
              styles['column--amount'],
              columnStyles.amount,
            )}
          >
            <input
              placeholder="Amount *"
              type="number"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              required
              aria-label="Amount"
            />
          </div>
        </div>
        <Button
          className={styles.buttonAdd}
          label={isPending ? 'Adding...' : 'Add'}
          padding="small"
          width="auto"
          type="submit"
          isDisabled={isPending}
        />
      </form>
    </div>
  );
};

export default AddRecordForm;
