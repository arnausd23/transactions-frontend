import { Pagination, PaginatedResult } from '../types/pagination';

/**
 * Create pagination metadata from parameters
 */
export const createPagination = (
  currentPage: number,
  itemsPerPage: number,
  totalItems: number,
): Pagination => {
  // Validate inputs
  if (itemsPerPage <= 0) {
    throw new Error('Items per page must be greater than 0');
  }
  if (currentPage < 1) {
    throw new Error('Current page must be at least 1');
  }
  if (totalItems < 0) {
    throw new Error('Total items cannot be negative');
  }

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Paginates a list of items
 *
 * @param items - Full list of items (should be pre-sorted)
 * @param currentPage - Current page number (1-based)
 * @param itemsPerPage - Number of items to show per page (default: 10)
 * @returns Paginated result with items and pagination metadata
 */
export const paginateItems = <T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number = 10,
): PaginatedResult<T> => {
  const pagination = createPagination(currentPage, itemsPerPage, items.length);
  const paginatedItems = items.slice(pagination.startIndex, pagination.endIndex);

  return {
    items: paginatedItems,
    pagination,
  };
};

/**
 * Calculates which page a specific item would be on
 * Useful for navigating to a newly added item
 *
 * @param items - Full list of items (should be pre-sorted in the same order as displayed)
 * @param itemId - ID of the item to find (or a predicate function)
 * @param itemsPerPage - Number of items per page (default: 10)
 * @returns Page number (1-based) where the item is located, or 1 if not found
 */
export const findItemPage = <T>(
  items: T[],
  itemId: string | ((item: T) => boolean),
  itemsPerPage: number = 10,
): number => {
  const index =
    typeof itemId === 'string'
      ? items.findIndex((item: any) => item.id === itemId)
      : items.findIndex(itemId);

  if (index === -1) return 1;

  return Math.floor(index / itemsPerPage) + 1;
};

