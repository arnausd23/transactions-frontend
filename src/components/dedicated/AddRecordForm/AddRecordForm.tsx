import React, { FC, useState, FormEvent, useCallback } from 'react';
import cx from 'classnames';

import { columnStyles } from 'components/dedicated/TransactionsTable/TransactionsTable';
import Button from 'components/core/Button/Button';
import ErrorMessage from 'components/core/ErrorMessage/ErrorMessage';
import { useAddTransaction, AddTransactionInput } from 'hooks/useAddTransaction';

import styles from './AddRecordForm.module.scss';

interface AddRecordFormProps {
  onTransactionAdded?: (transactionId: string) => void;
}

interface FieldErrors {
  payee?: string;
  amount?: string;
  date?: string;
}

const AddRecordForm: FC<AddRecordFormProps> = ({ onTransactionAdded }) => {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutateAsync, isLoading } = useAddTransaction();

  const validateField = (
    name: string,
    value: string,
  ): string | undefined => {
    switch (name) {
      case 'payee':
        if (!value || value.trim().length === 0) {
          return 'Payee is required';
        }
        if (value.trim().length < 2) {
          return 'Payee must be at least 2 characters';
        }
        return undefined;
      case 'amount':
        if (!value || value.trim().length === 0) {
          return 'Amount is required';
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'Amount must be a valid number';
        }
        if (numValue === 0) {
          return 'Amount cannot be zero';
        }
        return undefined;
      case 'date':
        if (value && value.trim().length > 0) {
          // Validate date format: YYYY-MM-DD HH:mm or YYYY-MM-DD
          const dateRegex =
            /^\d{4}-\d{2}-\d{2}(\s+\d{1,2}:\d{2})?$/;
          if (!dateRegex.test(value.trim())) {
            return 'Please use format: YYYY-MM-DD or YYYY-MM-DD HH:mm';
          }
          const parsedDate = new Date(value.trim());
          if (isNaN(parsedDate.getTime())) {
            return 'Invalid date. Please check the format.';
          }
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const payeeError = validateField('payee', payee);
    const amountError = validateField('amount', amount);
    const dateError = validateField('date', date);

    if (payeeError) errors.payee = payeeError;
    if (amountError) errors.amount = amountError;
    if (dateError) errors.date = dateError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearForm = useCallback(() => {
    setPayee('');
    setAmount('');
    setMemo('');
    setDate('');
    setFieldErrors({});
    setSubmitError(null);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const input: AddTransactionInput = {
        payee: payee.trim(),
        amount: amount.trim(),
        timestamp: date.trim() || new Date().toISOString().slice(0, 16),
        memo: memo.trim() || undefined,
      };

      const newTransaction = await mutateAsync(input);

      setSuccessMessage('Transaction added successfully!');
      clearForm();

      if (onTransactionAdded) {
        onTransactionAdded(newTransaction.id);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to add transaction. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>Add record</div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Success message */}
        {successMessage && (
          <div className={styles.success} role="alert">
            <svg
              className={styles.successIcon}
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
            {successMessage}
          </div>
        )}

        {/* Submit error */}
        {submitError && (
          <div className={styles.submitError}>
            <ErrorMessage error={submitError} />
          </div>
        )}

        <div className={styles.fields}>
          <div className={cx(styles.column, columnStyles.date)}>
            <input
              placeholder="YYYY-MM-DD HH:mm (optional)"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (fieldErrors.date) {
                  handleFieldBlur('date', e.target.value);
                }
              }}
              onBlur={(e) => handleFieldBlur('date', e.target.value)}
              disabled={isLoading}
              aria-label="Date in YYYY-MM-DD HH:mm format"
              aria-invalid={!!fieldErrors.date}
              aria-describedby={fieldErrors.date ? 'date-error' : undefined}
              className={cx({ [styles.inputError]: fieldErrors.date })}
            />
            {fieldErrors.date && (
              <span
                id="date-error"
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.date}
              </span>
            )}
          </div>

          <div className={cx(styles.column, columnStyles.payee)}>
            <input
              placeholder="Payee *"
              value={payee}
              onChange={(e) => {
                setPayee(e.target.value);
                if (fieldErrors.payee) {
                  handleFieldBlur('payee', e.target.value);
                }
              }}
              onBlur={(e) => handleFieldBlur('payee', e.target.value)}
              disabled={isLoading}
              required
              aria-label="Payee"
              aria-invalid={!!fieldErrors.payee}
              aria-describedby={fieldErrors.payee ? 'payee-error' : undefined}
              className={cx({ [styles.inputError]: fieldErrors.payee })}
            />
            {fieldErrors.payee && (
              <span
                id="payee-error"
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.payee}
              </span>
            )}
          </div>

          <div className={cx(styles.column, columnStyles.memo)}>
            <input
              placeholder="Memo (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isLoading}
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
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (fieldErrors.amount) {
                  handleFieldBlur('amount', e.target.value);
                }
              }}
              onBlur={(e) => handleFieldBlur('amount', e.target.value)}
              disabled={isLoading}
              required
              aria-label="Amount"
              aria-invalid={!!fieldErrors.amount}
              aria-describedby={fieldErrors.amount ? 'amount-error' : undefined}
              className={cx({ [styles.inputError]: fieldErrors.amount })}
            />
            {fieldErrors.amount && (
              <span
                id="amount-error"
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.amount}
              </span>
            )}
          </div>

          <div className={styles.column}>
            <Button
              className={styles.buttonAdd}
              label={isLoading ? 'Adding...' : 'Add'}
              padding="small"
              width="auto"
              type="submit"
              isDisabled={isLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddRecordForm;
