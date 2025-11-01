import { Pagination } from '../../../types/pagination';

export interface PaginationProps {
  pagination: Pagination;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
}
