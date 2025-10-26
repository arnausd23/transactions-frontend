import { Pagination } from './Pagination';

describe('Pagination Value Object', () => {
  describe('create factory method', () => {
    it('should create a valid pagination instance', () => {
      const pagination = Pagination.create(1, 10, 100);

      expect(pagination.getCurrentPage()).toBe(1);
      expect(pagination.getItemsPerPage()).toBe(10);
      expect(pagination.getTotalItems()).toBe(100);
    });
  });

  describe('validation', () => {
    it('should throw error if items per page is zero', () => {
      expect(() => Pagination.create(1, 0, 100)).toThrow(
        'Items per page must be greater than 0',
      );
    });

    it('should throw error if items per page is negative', () => {
      expect(() => Pagination.create(1, -5, 100)).toThrow(
        'Items per page must be greater than 0',
      );
    });

    it('should throw error if current page is zero', () => {
      expect(() => Pagination.create(0, 10, 100)).toThrow(
        'Current page must be at least 1',
      );
    });

    it('should throw error if current page is negative', () => {
      expect(() => Pagination.create(-1, 10, 100)).toThrow(
        'Current page must be at least 1',
      );
    });

    it('should throw error if total items is negative', () => {
      expect(() => Pagination.create(1, 10, -5)).toThrow(
        'Total items cannot be negative',
      );
    });

    it('should accept zero total items', () => {
      expect(() => Pagination.create(1, 10, 0)).not.toThrow();
    });
  });

  describe('totalPages calculation', () => {
    it('should return 1 page when total items is 0', () => {
      const pagination = Pagination.create(1, 10, 0);
      expect(pagination.totalPages).toBe(1);
    });

    it('should calculate total pages correctly when items divide evenly', () => {
      const pagination = Pagination.create(1, 10, 100);
      expect(pagination.totalPages).toBe(10);
    });

    it('should round up when items do not divide evenly', () => {
      const pagination = Pagination.create(1, 10, 95);
      expect(pagination.totalPages).toBe(10);
    });

    it('should return 1 page when total items is less than items per page', () => {
      const pagination = Pagination.create(1, 10, 5);
      expect(pagination.totalPages).toBe(1);
    });

    it('should calculate correctly with different page sizes', () => {
      const pagination = Pagination.create(1, 25, 100);
      expect(pagination.totalPages).toBe(4);
    });
  });

  describe('hasNextPage', () => {
    it('should return true when not on last page', () => {
      const pagination = Pagination.create(1, 10, 100);
      expect(pagination.hasNextPage).toBe(true);
    });

    it('should return false when on last page', () => {
      const pagination = Pagination.create(10, 10, 100);
      expect(pagination.hasNextPage).toBe(false);
    });

    it('should return false when only one page exists', () => {
      const pagination = Pagination.create(1, 10, 5);
      expect(pagination.hasNextPage).toBe(false);
    });

    it('should return false with zero items', () => {
      const pagination = Pagination.create(1, 10, 0);
      expect(pagination.hasNextPage).toBe(false);
    });
  });

  describe('hasPreviousPage', () => {
    it('should return false on first page', () => {
      const pagination = Pagination.create(1, 10, 100);
      expect(pagination.hasPreviousPage).toBe(false);
    });

    it('should return true when not on first page', () => {
      const pagination = Pagination.create(2, 10, 100);
      expect(pagination.hasPreviousPage).toBe(true);
    });

    it('should return true on last page', () => {
      const pagination = Pagination.create(10, 10, 100);
      expect(pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('startIndex', () => {
    it('should return 0 for first page', () => {
      const pagination = Pagination.create(1, 10, 100);
      expect(pagination.startIndex).toBe(0);
    });

    it('should return correct start index for middle page', () => {
      const pagination = Pagination.create(5, 10, 100);
      expect(pagination.startIndex).toBe(40);
    });

    it('should return correct start index for last page', () => {
      const pagination = Pagination.create(10, 10, 100);
      expect(pagination.startIndex).toBe(90);
    });

    it('should calculate correctly with different page sizes', () => {
      const pagination = Pagination.create(3, 25, 100);
      expect(pagination.startIndex).toBe(50);
    });
  });

  describe('endIndex', () => {
    it('should return items per page for first page with enough items', () => {
      const pagination = Pagination.create(1, 10, 100);
      expect(pagination.endIndex).toBe(10);
    });

    it('should return correct end index for middle page', () => {
      const pagination = Pagination.create(5, 10, 100);
      expect(pagination.endIndex).toBe(50);
    });

    it('should return total items for last page when items divide evenly', () => {
      const pagination = Pagination.create(10, 10, 100);
      expect(pagination.endIndex).toBe(100);
    });

    it('should return total items for last page when items do not divide evenly', () => {
      const pagination = Pagination.create(10, 10, 95);
      expect(pagination.endIndex).toBe(95);
    });

    it('should not exceed total items', () => {
      const pagination = Pagination.create(1, 10, 5);
      expect(pagination.endIndex).toBe(5);
    });

    it('should return 0 when total items is 0', () => {
      const pagination = Pagination.create(1, 10, 0);
      expect(pagination.endIndex).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle single item', () => {
      const pagination = Pagination.create(1, 10, 1);

      expect(pagination.totalPages).toBe(1);
      expect(pagination.startIndex).toBe(0);
      expect(pagination.endIndex).toBe(1);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(false);
    });

    it('should handle exactly one page of items', () => {
      const pagination = Pagination.create(1, 10, 10);

      expect(pagination.totalPages).toBe(1);
      expect(pagination.startIndex).toBe(0);
      expect(pagination.endIndex).toBe(10);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(false);
    });

    it('should handle large datasets', () => {
      const pagination = Pagination.create(100, 10, 1000);

      expect(pagination.totalPages).toBe(100);
      expect(pagination.startIndex).toBe(990);
      expect(pagination.endIndex).toBe(1000);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(true);
    });

    it('should handle page size of 1', () => {
      const pagination = Pagination.create(5, 1, 10);

      expect(pagination.totalPages).toBe(10);
      expect(pagination.startIndex).toBe(4);
      expect(pagination.endIndex).toBe(5);
      expect(pagination.hasNextPage).toBe(true);
      expect(pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical transaction pagination (page 1 of 7)', () => {
      const pagination = Pagination.create(1, 10, 65);

      expect(pagination.totalPages).toBe(7);
      expect(pagination.startIndex).toBe(0);
      expect(pagination.endIndex).toBe(10);
      expect(pagination.hasNextPage).toBe(true);
      expect(pagination.hasPreviousPage).toBe(false);
    });

    it('should handle typical transaction pagination (last page with partial items)', () => {
      const pagination = Pagination.create(7, 10, 65);

      expect(pagination.totalPages).toBe(7);
      expect(pagination.startIndex).toBe(60);
      expect(pagination.endIndex).toBe(65); // Only 5 items on last page
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(true);
    });

    it('should handle empty transaction list', () => {
      const pagination = Pagination.create(1, 10, 0);

      expect(pagination.totalPages).toBe(1);
      expect(pagination.startIndex).toBe(0);
      expect(pagination.endIndex).toBe(0);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(false);
    });
  });
});
