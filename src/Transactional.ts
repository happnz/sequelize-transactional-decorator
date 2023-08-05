import { DEFAULT_CONNECTION_NAME, getSequelize } from './init-sequelize-transactional';
import { Transaction, TransactionOptions } from 'sequelize';

type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

interface TransactionalOptions {
  connectionName?: string;
  isolationLevel?: IsolationLevel;
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

      const transactionOptions: TransactionOptions = {};

      if (options?.isolationLevel) {
        transactionOptions.isolationLevel = options.isolationLevel as Transaction.ISOLATION_LEVELS;
      }

      return await sequelize.transaction(transactionOptions, async () => {
        return await originalMethod.call(this, ...args);
      });
    };
  };
}
