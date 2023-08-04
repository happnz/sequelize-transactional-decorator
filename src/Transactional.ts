import { getSequelize } from './init-sequelize-transactional';

enum IsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

interface TransactionalOptions {
  isolationLevel: IsolationLevel;
}

export function Transactional(options?: TransactionalOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      return await getSequelize().transaction(async () => {
        return await originalMethod.call(this, ...args);
      });
    };
  };
}
