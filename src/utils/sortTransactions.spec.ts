import { sortByDate } from './sortTransactions';
import { TransactionRecord } from 'store/types';

describe('sortTransactions', () => {
  const mockTransactions: TransactionRecord[] = [
    {
      id: '1',
      amount: 100,
      payee: 'Test Payee 1',
      memo: 'Test memo 1',
      timestamp: 1609459200000, // 2021-01-01 00:00:00
    },
    {
      id: '2',
      amount: 200,
      payee: 'Test Payee 2',
      memo: 'Test memo 2',
      timestamp: 1640995200000, // 2022-01-01 00:00:00
    },
    {
      id: '3',
      amount: 300,
      payee: 'Test Payee 3',
      memo: 'Test memo 3',
      timestamp: 1672531200000, // 2023-01-01 00:00:00
    },
  ];

  describe('sortByDate', () => {
    it('should sort transactions in descending order by default (newest first)', () => {
      const result = sortByDate(mockTransactions);

      expect(result[0].id).toBe('3'); // 2023
      expect(result[1].id).toBe('2'); // 2022
      expect(result[2].id).toBe('1'); // 2021
    });

    it('should sort transactions in descending order when "desc" is specified', () => {
      const result = sortByDate(mockTransactions, 'desc');

      expect(result[0].id).toBe('3'); // 2023
      expect(result[1].id).toBe('2'); // 2022
      expect(result[2].id).toBe('1'); // 2021
    });

    it('should sort transactions in ascending order when "asc" is specified (oldest first)', () => {
      const result = sortByDate(mockTransactions, 'asc');

      expect(result[0].id).toBe('1'); // 2021
      expect(result[1].id).toBe('2'); // 2022
      expect(result[2].id).toBe('3'); // 2023
    });

    it('should not mutate the original array', () => {
      const original = [...mockTransactions];
      sortByDate(mockTransactions, 'asc');

      expect(mockTransactions).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = sortByDate([]);

      expect(result).toEqual([]);
    });

    it('should handle single transaction', () => {
      const singleTransaction = [mockTransactions[0]];
      const result = sortByDate(singleTransaction);

      expect(result).toEqual(singleTransaction);
    });
  });
});
