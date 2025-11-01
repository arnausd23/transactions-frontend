import React, { FC } from 'react';
import cx from 'classnames';

import Currency from 'components/core/Currency/Currency';
import { formatDate } from 'utils/date';

import { RecordRowProps } from './types';
import styles from './RecordRow.module.scss';

const currencyStyles = {
  negative: styles['currency--negative'],
};

const RecordRow: FC<RecordRowProps> = ({
  columnStyles,
  transactionRecord,
  isNewlyAdded = false,
}) => {
  return (
    <div
      className={cx(styles.root, {
        [styles['root--highlighted']]: isNewlyAdded,
      })}
    >
      <div className={cx(styles.column, columnStyles.date)}>
        {formatDate(transactionRecord.timestamp)}
      </div>
      <div className={cx(styles.column, columnStyles.payee)}>
        {transactionRecord.payee}
      </div>
      <div className={cx(styles.column, columnStyles.memo)}>
        {transactionRecord.memo || '-'}
      </div>
      <div className={cx(styles.column, columnStyles.amount)}>
        <Currency
          amount={transactionRecord.amount}
          className={cx(styles.currency, {
            [currencyStyles.negative]: transactionRecord.amount < 0,
          })}
        />
      </div>
    </div>
  );
};

export default RecordRow;
