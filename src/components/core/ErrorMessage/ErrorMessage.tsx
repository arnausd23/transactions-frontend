import React, { FC } from 'react';
import cx from 'classnames';
import { getUserFriendlyMessage } from '../../../utils/errorHandling';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  error: unknown;
  className?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Reusable error message component
 * Displays user-friendly error messages with optional retry button
 */
const ErrorMessage: FC<ErrorMessageProps> = ({
  error,
  className,
  onRetry,
  showRetry = false,
}) => {
  const message = getUserFriendlyMessage(error);

  return (
    <div className={cx(styles.root, className)} role="alert">
      <div className={styles.content}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={styles.message}>{message}</p>
      </div>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className={styles.retryButton}
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

