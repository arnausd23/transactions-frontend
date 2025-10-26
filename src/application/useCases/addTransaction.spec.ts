/**
 * Tests for addTransaction Use Case
 */

import { addTransaction, AddTransactionInput } from './addTransaction';
import { Transaction } from '../../domain/entities/Transaction';
import { fetchAPI } from '../../infrastructure/api/fetchAPI';

// Mock the fetchAPI module
jest.mock('../../infrastructure/api/fetchAPI');

const mockFetchAPI = fetchAPI as jest.MockedFunction<typeof fetchAPI>;

describe('addTransaction Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction with valid data', async () => {
    // Arrange
    const input: AddTransactionInput = {
      payee: 'Coffee Shop',
      amount: 4.5,
      timestamp: 1698345600000,
      memo: 'Morning coffee',
    };

    const mockApiResponse = {
      id: 'mock-id-123',
      payee: 'Coffee Shop',
      amount: 450, // amount in cents
      timestamp: 1698345600000,
      memo: 'Morning coffee',
    };

    mockFetchAPI.mockResolvedValueOnce(mockApiResponse);

    // Act
    const result = await addTransaction(input);

    // Assert
    expect(mockFetchAPI).toHaveBeenCalledWith({
      url: '/api/transactions',
      method: 'POST',
      body: {
        payee: 'Coffee Shop',
        amount: 450, // $4.5 converted to 450 cents
        timestamp: 1698345600000,
        memo: 'Morning coffee',
      },
    });

    expect(result).toBeInstanceOf(Transaction);
    expect(result.id).toBe('mock-id-123');
    expect(result.payee).toBe('Coffee Shop');
    expect(result.amount).toBe(450);
    expect(result.timestamp).toBe(1698345600000);
    expect(result.memo).toBe('Morning coffee');
  });

  it('should throw validation error when payee is empty', async () => {
    // Arrange
    const input: AddTransactionInput = {
      payee: '',
      amount: 100,
      timestamp: 1698345600000,
    };

    // Act & Assert
    await expect(addTransaction(input)).rejects.toThrow(
      'Transaction validation failed: Payee cannot be empty',
    );

    // Ensure API was not called
    expect(mockFetchAPI).not.toHaveBeenCalled();
  });

  it('should throw validation error when amount is invalid', async () => {
    // Arrange
    const input: AddTransactionInput = {
      payee: 'Test Shop',
      amount: 'invalid-amount',
      timestamp: 1698345600000,
    };

    // Act & Assert
    await expect(addTransaction(input)).rejects.toThrow(
      'Amount must be a valid number',
    );

    // Ensure API was not called
    expect(mockFetchAPI).not.toHaveBeenCalled();
  });

  it('should throw validation error when timestamp is invalid', async () => {
    // Arrange
    const input: AddTransactionInput = {
      payee: 'Test Shop',
      amount: 50,
      timestamp: 'invalid-date',
    };

    // Act & Assert
    await expect(addTransaction(input)).rejects.toThrow('Invalid date format');

    // Ensure API was not called
    expect(mockFetchAPI).not.toHaveBeenCalled();
  });
});
