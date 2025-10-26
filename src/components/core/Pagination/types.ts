import { Pagination as PaginationVO } from '../../../domain/valueObjects/Pagination';

export interface PaginationProps {
  pagination: PaginationVO;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
}
