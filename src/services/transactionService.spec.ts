import { transactionService } from './transactionService';
import { Transaction } from '../types/transaction';
import { ErrorType } from '../types/errors';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('transactionService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchTransactions', () => {
    it('should fetch and return transactions successfully', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          payee: 'Test Payee 1',
          amount: 10000,
          timestamp: 1609459200000,
          memo: 'Test memo 1',
        },
        {
          id: '2',
          payee: 'Test Payee 2',
          amount: -5000,
          timestamp: 1609545600000,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      const result = await transactionService.fetchTransactions();

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should throw error when response is not an array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'not an array' }),
      });

      await expect(
        transactionService.fetchTransactions(),
      ).rejects.toMatchObject({
        message: 'Invalid response format: expected an array',
      });
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error occurred' }),
      });

      await expect(
        transactionService.fetchTransactions(),
      ).rejects.toMatchObject({
        type: ErrorType.API,
        message: 'Server error occurred',
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        transactionService.fetchTransactions(),
      ).rejects.toMatchObject({
        type: ErrorType.NETWORK,
      });
    });

    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        transactionService.fetchTransactions(),
      ).rejects.toMatchObject({
        type: ErrorType.API,
      });
    });
  });

  describe('createTransaction', () => {
    describe('successful transaction creation', () => {
      it('should create transaction with string amount', async () => {
        const inputTimestamp = '2021-01-01 00:00';
        const expectedTimestamp = new Date(inputTimestamp).getTime();

        const mockTransaction: Transaction = {
          id: '123',
          payee: 'Test Payee',
          amount: 10000,
          timestamp: expectedTimestamp,
          memo: 'Test memo',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        const result = await transactionService.createTransaction({
          amount: '100.00',
          payee: 'Test Payee',
          timestamp: inputTimestamp,
          memo: 'Test memo',
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody).toEqual({
          amount: 10000,
          payee: 'Test Payee',
          timestamp: expectedTimestamp,
          memo: 'Test memo',
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch.mock.calls[0][0]).toBe('/api/transactions');
        expect(mockFetch.mock.calls[0][1].method).toBe('POST');
        expect(result).toEqual(mockTransaction);
      });

      it('should create transaction with numeric amount', async () => {
        const inputTimestamp = 1609545600000;

        const mockTransaction: Transaction = {
          id: '456',
          payee: 'Another Payee',
          amount: 25050,
          timestamp: inputTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        const result = await transactionService.createTransaction({
          amount: 250.5,
          payee: 'Another Payee',
          timestamp: inputTimestamp,
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.amount).toBe(25050);
        expect(callBody.payee).toBe('Another Payee');
        expect(callBody.timestamp).toBe(inputTimestamp);
        expect(result).toEqual(mockTransaction);
      });

      it('should create transaction without memo', async () => {
        const inputTimestamp = '2021-01-03';
        const expectedTimestamp = new Date(inputTimestamp).getTime();

        const mockTransaction: Transaction = {
          id: '789',
          payee: 'No Memo Payee',
          amount: 5000,
          timestamp: expectedTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        const result = await transactionService.createTransaction({
          amount: 50,
          payee: 'No Memo Payee',
          timestamp: inputTimestamp,
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody).not.toHaveProperty('memo');
        expect(callBody.timestamp).toBe(expectedTimestamp);
        expect(result).toEqual(mockTransaction);
      });

      it('should trim whitespace from payee and memo', async () => {
        const inputTimestamp = 1609459200000;

        const mockTransaction: Transaction = {
          id: '999',
          payee: 'Trimmed Payee',
          amount: 1000,
          timestamp: inputTimestamp,
          memo: 'Trimmed memo',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: 10,
          payee: '  Trimmed Payee  ',
          timestamp: inputTimestamp,
          memo: '  Trimmed memo  ',
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.payee).toBe('Trimmed Payee');
        expect(callBody.memo).toBe('Trimmed memo');
      });

      it('should omit memo if it is only whitespace', async () => {
        const inputTimestamp = 1609459200000;

        const mockTransaction: Transaction = {
          id: '888',
          payee: 'Payee',
          amount: 1000,
          timestamp: inputTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: 10,
          payee: 'Payee',
          timestamp: inputTimestamp,
          memo: '   ',
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody).not.toHaveProperty('memo');
      });

      it('should handle negative amounts', async () => {
        const inputTimestamp = 1609459200000;

        const mockTransaction: Transaction = {
          id: '321',
          payee: 'Refund',
          amount: -15000,
          timestamp: inputTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: -150,
          payee: 'Refund',
          timestamp: inputTimestamp,
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.amount).toBe(-15000);
      });
    });

    describe('validation errors', () => {
      it('should throw error for invalid amount string', async () => {
        await expect(
          transactionService.createTransaction({
            amount: 'not-a-number',
            payee: 'Test Payee',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Amount must be a valid number',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error for NaN amount', async () => {
        await expect(
          transactionService.createTransaction({
            amount: NaN,
            payee: 'Test Payee',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Amount must be a valid number',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error for missing timestamp', async () => {
        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: 'Test Payee',
            timestamp: '',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Timestamp is required',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error for invalid date format', async () => {
        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: 'Test Payee',
            timestamp: 'invalid-date',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Invalid date format. Please use YYYY-MM-DD HH:mm format.',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error for empty payee', async () => {
        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: '',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Payee is required',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should throw error for whitespace-only payee', async () => {
        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: '   ',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Payee is required',
        });

        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('date format handling', () => {
      it('should accept YYYY-MM-DD format', async () => {
        const inputTimestamp = '2021-01-01';
        const expectedTimestamp = new Date(inputTimestamp).getTime();

        const mockTransaction: Transaction = {
          id: '111',
          payee: 'Date Test',
          amount: 1000,
          timestamp: expectedTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: 10,
          payee: 'Date Test',
          timestamp: inputTimestamp,
        });

        expect(mockFetch).toHaveBeenCalled();
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.timestamp).toBe(expectedTimestamp);
      });

      it('should accept YYYY-MM-DD HH:mm format', async () => {
        const inputTimestamp = '2021-01-01 12:30';
        const expectedTimestamp = new Date(inputTimestamp).getTime();

        const mockTransaction: Transaction = {
          id: '222',
          payee: 'DateTime Test',
          amount: 1000,
          timestamp: expectedTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: 10,
          payee: 'DateTime Test',
          timestamp: inputTimestamp,
        });

        expect(mockFetch).toHaveBeenCalled();
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.timestamp).toBe(expectedTimestamp);
      });

      it('should accept numeric timestamp', async () => {
        const inputTimestamp = 1609459200000;

        const mockTransaction: Transaction = {
          id: '333',
          payee: 'Numeric Timestamp Test',
          amount: 1000,
          timestamp: inputTimestamp,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        });

        await transactionService.createTransaction({
          amount: 10,
          payee: 'Numeric Timestamp Test',
          timestamp: inputTimestamp,
        });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.timestamp).toBe(inputTimestamp);
      });
    });

    describe('API error handling', () => {
      it('should handle 400 validation errors from API', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({ message: 'Invalid transaction data' }),
        });

        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: 'Test',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Invalid transaction data',
        });
      });

      it('should handle 500 server errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ message: 'Database error' }),
        });

        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: 'Test',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.API,
          message: 'Database error',
        });
      });

      it('should handle network failures during creation', async () => {
        mockFetch.mockRejectedValueOnce(
          new TypeError('Network request failed'),
        );

        await expect(
          transactionService.createTransaction({
            amount: 100,
            payee: 'Test',
            timestamp: '2021-01-01',
          }),
        ).rejects.toMatchObject({
          type: ErrorType.NETWORK,
        });
      });
    });
  });
});
