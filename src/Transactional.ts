import { getSequelize, getTransactionalNamespace } from './init-sequelize-transactional';
import { Transaction, TransactionOptions } from 'sequelize';

type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

type Propagation =
  | 'REQUIRED'
  | 'SUPPORTS'
  | 'MANDATORY'
  | 'NEVER'
  | 'NOT_SUPPORTED'
  | 'REQUIRES_NEW';

const DEFAULT_PROPAGATION = 'REQUIRED';

interface TransactionalOptions {
  isolationLevel?: IsolationLevel;
  propagation?: Propagation;
}

export function Transactional(options?: TransactionalOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const sequelize = getSequelize();

      if (!sequelize) {
        throw new Error(
          'Error trying to get sequelize connection in @Transactional method. It is possible that your Sequelize connection uses custom name and you did not specify it in decorator "connectionName" option'
        );
      }

      const callOriginalMethod = async () => originalMethod.call(this, ...args);

      const transactionOptions: TransactionOptions = {};

      if (options?.isolationLevel) {
        transactionOptions.isolationLevel = options.isolationLevel as Transaction.ISOLATION_LEVELS;
      }

      const callInNewTransaction = async () =>
        sequelize.transaction(transactionOptions, async () => {
          return await callOriginalMethod();
        });

      const transactionalNamespace = getTransactionalNamespace();

      const currentTransaction = transactionalNamespace.get('transaction');

      const currentTransactionExists = currentTransaction?.sequelize === sequelize;

      const propagation = options?.propagation || DEFAULT_PROPAGATION;

      if (propagation === 'REQUIRED') {
        if (currentTransactionExists) {
          return await callOriginalMethod();
        }
        return await callInNewTransaction();
      }

      if (propagation === 'SUPPORTS') {
        return await callOriginalMethod();
      }

      if (propagation === 'MANDATORY') {
        if (currentTransactionExists) {
          return await callOriginalMethod();
        }
        throw new Error(
          'For transaction with Propagation.MANDATORY active transaction is required but was not found'
        );
      }

      if (propagation === 'NEVER') {
        if (currentTransactionExists) {
          throw new Error(
            'For transaction with Propagation.NEVER there must be no active transaction but one was not found'
          );
        }
        return await callOriginalMethod();
      }

      if (propagation === 'NOT_SUPPORTED') {
        if (currentTransactionExists) {
          transactionalNamespace.set('transaction', null);

          try {
            return await callOriginalMethod();
          } finally {
            transactionalNamespace.set('transaction', currentTransaction);
          }
        } else {
          return await callOriginalMethod();
        }
      }

      if (propagation === 'REQUIRES_NEW') {
        return await callInNewTransaction();
      }
    };
  };
}
