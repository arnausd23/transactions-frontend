/**
 * Transaction interface representing a financial transaction
 */
export interface Transaction {
  id: string;
  amount: number;
  payee: string;
  memo?: string;
  timestamp: number;
}

/**
 * Payload for creating a new transaction
 */
export interface CreateTransactionPayload {
  amount: number;
  payee: string;
  timestamp: number;
  memo?: string;
}
