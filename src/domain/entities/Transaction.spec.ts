/**
 * Tests for Transaction Domain Entity
 */

import { Transaction, TransactionDTO } from './Transaction';

describe('Transaction Domain Entity', () => {
  describe('fromApi factory method', () => {
    it('should create a transaction from valid API data', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id-123',
        payee: 'Coffee Shop',
        amount: -4.5,
        timestamp: 1698345600000,
        memo: 'Morning coffee',
      };

      // Act
      const transaction = Transaction.fromApi(dto);

      // Assert
      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBe('test-id-123');
      expect(transaction.payee).toBe('Coffee Shop');
      expect(transaction.amount).toBe(-4.5);
      expect(transaction.timestamp).toBe(1698345600000);
      expect(transaction.memo).toBe('Morning coffee');
    });

    it('should throw error when API data has empty ID', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: '',
        payee: 'Test Shop',
        amount: 100,
        timestamp: 1698345600000,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: ID cannot be empty',
      );
    });

    it('should throw error when API data has empty payee', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id',
        payee: '',
        amount: 100,
        timestamp: 1698345600000,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: Payee cannot be empty',
      );
    });

    it('should throw error when API data has invalid amount', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id',
        payee: 'Test Shop',
        amount: NaN,
        timestamp: 1698345600000,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: Amount must be a valid number',
      );
    });

    it('should throw error when API data has invalid timestamp', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id',
        payee: 'Test Shop',
        amount: 100,
        timestamp: -1,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: Timestamp must be a valid positive number',
      );
    });
  });

  describe('create factory method', () => {
    it('should create a new transaction with valid data', () => {
      // Arrange & Act
      const transaction = Transaction.create(
        'Restaurant',
        -25.5,
        1698345600000,
        'Lunch',
      );

      // Assert
      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBeTruthy(); // Generated ID
      expect(transaction.payee).toBe('Restaurant');
      expect(transaction.amount).toBe(-25.5);
      expect(transaction.timestamp).toBe(1698345600000);
      expect(transaction.memo).toBe('Lunch');
    });

    it('should create a transaction without memo', () => {
      // Arrange & Act
      const transaction = Transaction.create('Gas Station', -50, 1698345600000);

      // Assert
      expect(transaction.memo).toBe('');
    });

    it('should generate unique IDs for different transactions', () => {
      // Arrange & Act
      const transaction1 = Transaction.create('Shop A', 100, 1698345600000);
      const transaction2 = Transaction.create('Shop B', 200, 1698345600000);

      // Assert
      expect(transaction1.id).not.toBe(transaction2.id);
    });
  });

  describe('toApi method', () => {
    it('should convert transaction to API DTO format', () => {
      // Arrange
      const transaction = Transaction.create(
        'Coffee Shop',
        -4.5,
        1698345600000,
        'Morning coffee',
      );

      // Act
      const dto = transaction.toApi();

      // Assert
      expect(dto).toEqual({
        payee: 'Coffee Shop',
        amount: -4.5,
        timestamp: 1698345600000,
        memo: 'Morning coffee',
      });
    });

    it('should include memo in DTO when present', () => {
      // Arrange
      const transaction = Transaction.create(
        'Restaurant',
        -30,
        1698345600000,
        'Dinner',
      );

      // Act
      const dto = transaction.toApi();

      // Assert
      expect(dto.memo).toBe('Dinner');
    });

    it('should not include memo in DTO when empty', () => {
      // Arrange
      const transaction = Transaction.create(
        'Gas Station',
        -50,
        1698345600000,
        '',
      );

      // Act
      const dto = transaction.toApi();

      // Assert
      expect(dto).not.toHaveProperty('memo');
    });
  });

  describe('business logic methods', () => {
    describe('isNegative', () => {
      it('should return true for negative amounts (expenses)', () => {
        // Arrange
        const transaction = Transaction.create(
          'Electric Bill',
          -150,
          1698345600000,
        );

        // Act & Assert
        expect(transaction.isNegative()).toBe(true);
      });

      it('should return false for positive amounts (income)', () => {
        // Arrange
        const transaction = Transaction.create('Salary', 3000, 1698345600000);

        // Act & Assert
        expect(transaction.isNegative()).toBe(false);
      });

      it('should return false for zero amount', () => {
        // Arrange
        const transaction = Transaction.create('Free Sample', 0, 1698345600000);

        // Act & Assert
        expect(transaction.isNegative()).toBe(false);
      });
    });
  });

  describe('getters', () => {
    it('should provide access to all transaction properties', () => {
      // Arrange
      const transaction = Transaction.create(
        'Test Payee',
        -100,
        1698345600000,
        'Test memo',
      );

      // Act & Assert
      expect(transaction.id).toBeTruthy();
      expect(transaction.payee).toBe('Test Payee');
      expect(transaction.amount).toBe(-100);
      expect(transaction.timestamp).toBe(1698345600000);
      expect(transaction.memo).toBe('Test memo');
    });

    it('should return empty string for memo when not provided', () => {
      // Arrange
      const transaction = Transaction.create('Test', 100, 1698345600000);

      // Act & Assert
      expect(transaction.memo).toBe('');
    });
  });

  describe('validation rules', () => {
    it('should validate payee is not whitespace only', () => {
      // Act & Assert
      expect(() => Transaction.create('   ', 100, 1698345600000)).toThrow(
        'Transaction validation failed: Payee cannot be empty',
      );
    });

    it('should validate timestamp is a number', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id',
        payee: 'Test',
        amount: 100,
        timestamp: NaN,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: Timestamp must be a valid positive number',
      );
    });

    it('should validate timestamp is positive', () => {
      // Arrange
      const dto: TransactionDTO = {
        id: 'test-id',
        payee: 'Test',
        amount: 100,
        timestamp: 0,
      };

      // Act & Assert
      expect(() => Transaction.fromApi(dto)).toThrow(
        'Transaction validation failed: Timestamp must be a valid positive number',
      );
    });

    it('should accept negative amounts (expenses)', () => {
      // Act
      const transaction = Transaction.create('Expense', -500, 1698345600000);

      // Assert
      expect(transaction.amount).toBe(-500);
    });

    it('should accept positive amounts (income)', () => {
      // Act
      const transaction = Transaction.create('Income', 1000, 1698345600000);

      // Assert
      expect(transaction.amount).toBe(1000);
    });

    it('should accept zero amount', () => {
      // Act
      const transaction = Transaction.create('Free', 0, 1698345600000);

      // Assert
      expect(transaction.amount).toBe(0);
    });
  });
});
