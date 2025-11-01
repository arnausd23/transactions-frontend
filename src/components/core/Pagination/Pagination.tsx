import React, { FC } from 'react';
import cx from 'classnames';
import { PaginationProps } from './types';
import styles from './Pagination.module.scss';

/**
 * Pagination Component
 * Provides navigation controls for paginated content with page numbers
 */
export const Pagination: FC<PaginationProps> = ({
  pagination,
  onNextPage,
  onPreviousPage,
  onGoToPage,
}) => {
  const currentPage = pagination.currentPage;
  const totalPages = pagination.totalPages;
  const totalItems = pagination.totalItems;
  const startIndex = pagination.startIndex;
  const endIndex = pagination.endIndex;

  if (totalItems === 0) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.pagination}>
      <div className={styles.pagination__info}>
        <span className={styles['pagination__results-text']}>
          Results: {startIndex + 1} - {endIndex} of {totalItems}
        </span>
      </div>

      <div className={styles.pagination__controls}>
        {/* Previous button */}
        <button
          onClick={onPreviousPage}
          disabled={!pagination.hasPreviousPage}
          className={cx(
            styles.pagination__button,
            styles['pagination__button--arrow'],
          )}
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page number buttons */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={styles.pagination__ellipsis}
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onGoToPage(pageNum)}
              className={cx(styles.pagination__button, {
                [styles['pagination__button--active']]: isActive,
              })}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={onNextPage}
          disabled={!pagination.hasNextPage}
          className={cx(
            styles.pagination__button,
            styles['pagination__button--arrow'],
          )}
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
