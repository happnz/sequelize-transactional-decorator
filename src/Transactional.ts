import { DEFAULT_CONNECTION_NAME, getSequelize } from './init-sequelize-transactional';

enum IsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

interface TransactionalOptions {
  connectionName?: string;
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

      return await sequelize.transaction(async () => {
        return await originalMethod.call(this, ...args);
      });
    };
  };
}
