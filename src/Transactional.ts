import {
  DEFAULT_CONNECTION_NAME,
  getSequelize,
  getTransactionalNamespace,
} from './init-sequelize-transactional';
import { Transaction, TransactionOptions } from 'sequelize';

type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

type Propagation = 'REQUIRED' | 'SUPPORTS' | 'MANDATORY' | 'NEVER';

const DEFAULT_PROPAGATION = 'REQUIRED';

interface TransactionalOptions {
  connectionName?: string;
  isolationLevel?: IsolationLevel;
  propagation?: Propagation;
}

export function Transactional(options?: TransactionalOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const connectionName = options?.connectionName || DEFAULT_CONNECTION_NAME;

      const sequelize = getSequelize(connectionName);

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

      const currentTransaction = getTransactionalNamespace().get('transaction');

      const currentTransactionExists = currentTransaction?.sequelize === sequelize;

      const propagation = options?.propagation || DEFAULT_PROPAGATION;

      if (propagation === 'REQUIRED') {
        if (currentTransactionExists) {
          return await callOriginalMethod();
        }
        return await sequelize.transaction(transactionOptions, async () => {
          return await callOriginalMethod();
        });
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
    };
  };
}
