/**
 * Pagination Value Object
 * Encapsulates pagination logic and invariants following DDD principles
 */
export class Pagination {
  private constructor(
    private readonly currentPage: number,
    private readonly itemsPerPage: number,
    private readonly totalItems: number,
  ) {
    this.validate();
  }

  /**
   * Factory method to create a Pagination instance
   */
  static create(
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
  ): Pagination {
    return new Pagination(currentPage, itemsPerPage, totalItems);
  }

  /**
   * Validates pagination invariants
   */
  private validate(): void {
    if (this.itemsPerPage <= 0) {
      throw new Error('Items per page must be greater than 0');
    }
    if (this.currentPage < 1) {
      throw new Error('Current page must be at least 1');
    }
    if (this.totalItems < 0) {
      throw new Error('Total items cannot be negative');
    }
  }

  /**
   * Calculate total number of pages
   */
  get totalPages(): number {
    if (this.totalItems === 0) return 1;
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Check if there is a next page available
   */
  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  /**
   * Check if there is a previous page available
   */
  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  /**
   * Get the starting index for the current page (0-based)
   */
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  /**
   * Get the ending index for the current page (0-based, exclusive)
   */
  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  /**
   * Get current page number
   */
  getCurrentPage(): number {
    return this.currentPage;
  }

  /**
   * Get items per page
   */
  getItemsPerPage(): number {
    return this.itemsPerPage;
  }

  /**
   * Get total items count
   */
  getTotalItems(): number {
    return this.totalItems;
  }
}
