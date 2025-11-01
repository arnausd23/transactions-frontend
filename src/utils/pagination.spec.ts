import { createPagination, paginateItems, findItemPage } from './pagination';

describe('pagination', () => {
  describe('createPagination', () => {
    it('should create pagination metadata for first page', () => {
      const result = createPagination(1, 10, 50);

      expect(result).toEqual({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        startIndex: 0,
        endIndex: 10,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should create pagination metadata for middle page', () => {
      const result = createPagination(3, 10, 50);

      expect(result).toEqual({
        currentPage: 3,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        startIndex: 20,
        endIndex: 30,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should create pagination metadata for last page', () => {
      const result = createPagination(5, 10, 50);

      expect(result).toEqual({
        currentPage: 5,
        itemsPerPage: 10,
        totalItems: 50,
        totalPages: 5,
        startIndex: 40,
        endIndex: 50,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should handle last page with partial items', () => {
      const result = createPagination(3, 10, 25);

      expect(result).toEqual({
        currentPage: 3,
        itemsPerPage: 10,
        totalItems: 25,
        totalPages: 3,
        startIndex: 20,
        endIndex: 25,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should handle empty results', () => {
      const result = createPagination(1, 10, 0);

      expect(result).toEqual({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should throw error when itemsPerPage is zero', () => {
      expect(() => createPagination(1, 0, 50)).toThrow(
        'Items per page must be greater than 0',
      );
    });

    it('should throw error when itemsPerPage is negative', () => {
      expect(() => createPagination(1, -10, 50)).toThrow(
        'Items per page must be greater than 0',
      );
    });

    it('should throw error when currentPage is less than 1', () => {
      expect(() => createPagination(0, 10, 50)).toThrow(
        'Current page must be at least 1',
      );
    });

    it('should throw error when totalItems is negative', () => {
      expect(() => createPagination(1, 10, -5)).toThrow(
        'Total items cannot be negative',
      );
    });
  });

  describe('paginateItems', () => {
    const mockItems = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i + 1}`,
      value: i + 1,
    }));

    it('should paginate items for first page with default itemsPerPage', () => {
      const result = paginateItems(mockItems, 1);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('item-1');
      expect(result.items[9].id).toBe('item-10');
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should paginate items for second page', () => {
      const result = paginateItems(mockItems, 2, 10);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('item-11');
      expect(result.items[9].id).toBe('item-20');
      expect(result.pagination.currentPage).toBe(2);
    });

    it('should paginate items for last page with partial items', () => {
      const result = paginateItems(mockItems, 3, 10);

      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe('item-21');
      expect(result.items[4].id).toBe('item-25');
      expect(result.pagination.currentPage).toBe(3);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should handle custom itemsPerPage', () => {
      const result = paginateItems(mockItems, 1, 5);

      expect(result.items).toHaveLength(5);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle empty array', () => {
      const result = paginateItems([], 1, 10);

      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle single item', () => {
      const result = paginateItems([mockItems[0]], 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('findItemPage', () => {
    const mockItems = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i + 1}`,
      value: i + 1,
    }));

    it('should find page for first item', () => {
      const page = findItemPage(mockItems, 'item-1', 10);
      expect(page).toBe(1);
    });

    it('should find page for item on second page', () => {
      const page = findItemPage(mockItems, 'item-15', 10);
      expect(page).toBe(2);
    });

    it('should find page for item on third page', () => {
      const page = findItemPage(mockItems, 'item-25', 10);
      expect(page).toBe(3);
    });

    it('should find page for last item on page', () => {
      const page = findItemPage(mockItems, 'item-10', 10);
      expect(page).toBe(1);
    });

    it('should find page for first item on page', () => {
      const page = findItemPage(mockItems, 'item-11', 10);
      expect(page).toBe(2);
    });

    it('should return 1 when item not found', () => {
      const page = findItemPage(mockItems, 'non-existent', 10);
      expect(page).toBe(1);
    });

    it('should work with custom itemsPerPage', () => {
      const page = findItemPage(mockItems, 'item-15', 5);
      expect(page).toBe(3);
    });

    it('should work with predicate function', () => {
      const page = findItemPage(mockItems, (item) => item.value === 15, 10);
      expect(page).toBe(2);
    });

    it('should return 1 when predicate matches no items', () => {
      const page = findItemPage(mockItems, (item) => item.value === 999, 10);
      expect(page).toBe(1);
    });

    it('should handle empty array', () => {
      const page = findItemPage([], 'item-1', 10);
      expect(page).toBe(1);
    });
  });
});
