import { Transaction } from '../../domain/entities/Transaction';
import {
  paginateTransactions,
  findTransactionPage,
} from './paginateTransactions';

const createMockTransaction = (id: string, timestamp: number): Transaction => {
  return Transaction.fromApi({
    id,
    amount: 100,
    payee: 'Test Payee',
    timestamp,
    memo: 'Test memo',
  });
};

describe('paginateTransactions use case', () => {
  describe('paginateTransactions', () => {
    it('should paginate transactions correctly for first page', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 1, 10);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('tx-0');
      expect(result.items[9].id).toBe('tx-9');
      expect(result.pagination.getCurrentPage()).toBe(1);
      expect(result.pagination.getTotalItems()).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should paginate transactions correctly for middle page', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 2, 10);

      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('tx-10');
      expect(result.items[9].id).toBe('tx-19');
      expect(result.pagination.getCurrentPage()).toBe(2);
    });

    it('should paginate transactions correctly for last page with partial items', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 3, 10);

      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe('tx-20');
      expect(result.items[4].id).toBe('tx-24');
      expect(result.pagination.getCurrentPage()).toBe(3);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should handle empty transaction list', () => {
      const transactions: Transaction[] = [];

      const result = paginateTransactions(transactions, 1, 10);

      expect(result.items).toHaveLength(0);
      expect(result.pagination.getTotalItems()).toBe(0);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle single page of transactions', () => {
      const transactions = Array.from({ length: 5 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 1, 10);

      expect(result.items).toHaveLength(5);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should handle exactly one page worth of items', () => {
      const transactions = Array.from({ length: 10 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 1, 10);

      expect(result.items).toHaveLength(10);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should use default page size of 10 when not specified', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 1);

      expect(result.items).toHaveLength(10);
      expect(result.pagination.getItemsPerPage()).toBe(10);
    });

    it('should work with custom page size', () => {
      const transactions = Array.from({ length: 100 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 1, 25);

      expect(result.items).toHaveLength(25);
      expect(result.pagination.totalPages).toBe(4);
      expect(result.pagination.getItemsPerPage()).toBe(25);
    });

    it('should return pagination metadata correctly', () => {
      const transactions = Array.from({ length: 65 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const result = paginateTransactions(transactions, 5, 10);

      expect(result.pagination.getCurrentPage()).toBe(5);
      expect(result.pagination.getItemsPerPage()).toBe(10);
      expect(result.pagination.getTotalItems()).toBe(65);
      expect(result.pagination.totalPages).toBe(7);
      expect(result.pagination.startIndex).toBe(40);
      expect(result.pagination.endIndex).toBe(50);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('findTransactionPage', () => {
    it('should find transaction on first page', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-5', 10);

      expect(page).toBe(1);
    });

    it('should find transaction on second page', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-15', 10);

      expect(page).toBe(2);
    });

    it('should find transaction on last page', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-24', 10);

      expect(page).toBe(3);
    });

    it('should return 1 when transaction is not found', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'non-existent-id', 10);

      expect(page).toBe(1);
    });

    it('should handle transaction at page boundary (index 9 -> page 1)', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-9', 10);

      expect(page).toBe(1);
    });

    it('should handle transaction at page boundary (index 10 -> page 2)', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-10', 10);

      expect(page).toBe(2);
    });

    it('should use default page size of 10 when not specified', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-15');

      expect(page).toBe(2);
    });

    it('should work with custom page size', () => {
      const transactions = Array.from({ length: 100 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      // With page size 25: tx-50 should be on page 3 (0-24, 25-49, 50-74, 75-99)
      const page = findTransactionPage(transactions, 'tx-50', 25);

      expect(page).toBe(3);
    });

    it('should handle first transaction (index 0)', () => {
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      const page = findTransactionPage(transactions, 'tx-0', 10);

      expect(page).toBe(1);
    });

    it('should handle empty transaction list', () => {
      const transactions: Transaction[] = [];

      const page = findTransactionPage(transactions, 'tx-0', 10);

      expect(page).toBe(1);
    });

    it('should handle single transaction', () => {
      const transactions = [createMockTransaction('tx-0', Date.now())];

      const page = findTransactionPage(transactions, 'tx-0', 10);

      expect(page).toBe(1);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle newly added transaction on page 7', () => {
      // Simulate 65 transactions sorted by date (newest first)
      const transactions = Array.from({ length: 65 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      // New transaction added at position 62 (page 7)
      const newTxId = 'tx-62';
      const page = findTransactionPage(transactions, newTxId, 10);

      expect(page).toBe(7);

      // Verify we can paginate to that page
      const result = paginateTransactions(transactions, page, 10);
      expect(result.items.some((tx) => tx.id === newTxId)).toBe(true);
    });

    it('should handle pagination navigation workflow', () => {
      const transactions = Array.from({ length: 45 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      // Start on page 1
      let result = paginateTransactions(transactions, 1, 10);
      expect(result.pagination.getCurrentPage()).toBe(1);
      expect(result.pagination.hasPreviousPage).toBe(false);
      expect(result.pagination.hasNextPage).toBe(true);

      // Go to next page
      result = paginateTransactions(transactions, 2, 10);
      expect(result.pagination.getCurrentPage()).toBe(2);
      expect(result.pagination.hasPreviousPage).toBe(true);
      expect(result.pagination.hasNextPage).toBe(true);

      // Jump to page with specific transaction
      const targetPage = findTransactionPage(transactions, 'tx-35', 10);
      result = paginateTransactions(transactions, targetPage, 10);
      expect(result.items.some((tx) => tx.id === 'tx-35')).toBe(true);
      expect(result.pagination.getCurrentPage()).toBe(4);
    });

    it('should maintain consistency between pagination and finding', () => {
      const transactions = Array.from({ length: 33 }, (_, i) =>
        createMockTransaction(`tx-${i}`, Date.now() - i * 1000),
      );

      // Test each transaction to ensure it can be found and is on the correct page
      transactions.forEach((tx) => {
        const page = findTransactionPage(transactions, tx.id, 10);
        const result = paginateTransactions(transactions, page, 10);

        expect(result.items.some((item) => item.id === tx.id)).toBe(true);
      });
    });
  });
});
