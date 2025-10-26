import generateUid from '../../utils/generateUid';

/**
 * Transaction Data Transfer Object (DTO)
 * Represents the transaction structure from/to the API and internal domain model
 */
export interface TransactionDTO {
  id: string;
  amount: number;
  payee: string;
  timestamp: number;
  memo?: string;
}

/**
 * Transaction Domain Entity
 *
 * Encapsulates transaction business logic and validation rules.
 * Provides methods for API serialization/deserialization and domain operations.
 *
 */
export class Transaction {
  private constructor(private props: TransactionDTO) {
    this.validate();
  }

  /**
   * Factory method: Creates a Transaction entity from API response
   *
   * @param dto - Data Transfer Object from API
   * @returns Transaction entity instance
   * @throws Error if validation fails
   */
  static fromApi(dto: TransactionDTO): Transaction {
    return new Transaction({
      id: dto.id,
      amount: dto.amount,
      payee: dto.payee,
      timestamp: dto.timestamp,
      memo: dto.memo || '',
    });
  }

  /**
   * Factory method: Creates a new Transaction entity
   * Use this for creating transactions with already validated/parsed data
   *
   * @param payee - Name of the payee/merchant
   * @param amount - Transaction amount (negative for expenses, positive for income)
   * @param timestamp - Unix timestamp in milliseconds
   * @param memo - Optional memo/note
   * @returns Transaction entity instance
   * @throws Error if validation fails
   */
  static create(
    payee: string,
    amount: number,
    timestamp: number,
    memo?: string,
  ): Transaction {
    return new Transaction({
      id: generateUid(), // temporary ID generation
      payee,
      amount,
      timestamp,
      memo: memo,
    });
  }

  /**
   * Converts the domain entity to API DTO format, excludes id backend will generate it
   *
   * @returns TransactionDTO for API communication
   */
  toApi(): Omit<TransactionDTO, 'id'> {
    return {
      amount: this.props.amount,
      payee: this.props.payee,
      timestamp: this.props.timestamp,
      ...(this.props.memo && { memo: this.props.memo }),
    };
  }

  /**
   * Validates business rules and invariants
   *
   * @throws Error if validation fails
   * @private
   */
  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new Error('Transaction validation failed: ID cannot be empty');
    }

    if (!this.props.payee || this.props.payee.trim().length === 0) {
      throw new Error('Transaction validation failed: Payee cannot be empty');
    }

    if (typeof this.props.amount !== 'number' || isNaN(this.props.amount)) {
      throw new Error(
        'Transaction validation failed: Amount must be a valid number',
      );
    }

    if (
      typeof this.props.timestamp !== 'number' ||
      isNaN(this.props.timestamp) ||
      this.props.timestamp <= 0
    ) {
      throw new Error(
        'Transaction validation failed: Timestamp must be a valid positive number',
      );
    }
  }

  // ==================== Getters ====================

  /**
   * Gets the transaction ID
   */
  get id(): string {
    return this.props.id;
  }

  /**
   * Gets the transaction amount
   * Negative values represent expenses, positive values represent income
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * Gets the payee/merchant name
   */
  get payee(): string {
    return this.props.payee;
  }

  /**
   * Gets the transaction timestamp (Unix timestamp in milliseconds)
   */
  get timestamp(): number {
    return this.props.timestamp;
  }

  /**
   * Gets the transaction memo/note
   * Returns empty string if no memo is set
   */
  get memo(): string {
    return this.props.memo || '';
  }

  // ==================== Domain Methods (Business Logic) ====================

  /**
   * Checks if the transaction is negative (expense)
   *
   * @returns true if amount is negative
   */
  isNegative(): boolean {
    return this.props.amount < 0;
  }
}
