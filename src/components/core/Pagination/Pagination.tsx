import React, { FC } from 'react';
import Button from '../Button/Button';
import { PaginationProps } from './types';
import styles from './Pagination.module.scss';

/**
 * Pagination Component
 * Provides navigation controls for paginated content
 */
export const Pagination: FC<PaginationProps> = ({
  pagination,
  onNextPage,
  onPreviousPage,
}) => {
  const currentPage = pagination.currentPage;
  const totalPages = pagination.totalPages;
  const totalItems = pagination.totalItems;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        Showing {pagination.startIndex + 1}-{pagination.endIndex} of{' '}
        {totalItems} transactions
      </div>

      <div className={styles.controls}>
        <Button
          onClick={onPreviousPage}
          isDisabled={!pagination.hasPreviousPage}
          variant="secondary"
        >
          Previous
        </Button>

        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={onNextPage}
          isDisabled={!pagination.hasNextPage}
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
