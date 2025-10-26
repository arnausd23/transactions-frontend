import { Transaction } from 'domain/entities/Transaction';

export interface RecordRowProps {
  columnStyles: {
    amount: string;
    date: string;
    payee: string;
    memo: string;
  };
  transactionRecord: Transaction;
  isNewlyAdded?: boolean;
}
