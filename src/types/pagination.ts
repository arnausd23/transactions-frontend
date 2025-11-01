/**
 * Pagination metadata
 */
export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Result of a paginated query
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

