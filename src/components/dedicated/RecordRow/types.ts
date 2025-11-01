import { Transaction } from '../../../types/transaction';

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
