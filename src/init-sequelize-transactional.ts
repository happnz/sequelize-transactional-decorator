import { Sequelize } from 'sequelize';
import { createNamespace, Namespace } from 'cls-hooked';

let transactionalNamespace: Namespace;

export const getTransactionalNamespace = () => {
  if (transactionalNamespace) {
    return transactionalNamespace;
  }
  throw new Error(
    'Could not find namespace for transactions. Make sure you called initSequelizeCLS() before creating Sequelize connections'
  );
};

export function initSequelizeCLS() {
  if (typeof Sequelize.useCLS === 'function') {
    transactionalNamespace = createNamespace('sequelize-transactional-decorator-namespace');
    Sequelize.useCLS(transactionalNamespace);
  } else {
    throw Error('Cannot call Sequelize.useCLS (need Sequelize version 4 or later)');
  }
}

export const DEFAULT_CONNECTION_NAME = 'default';

const sequelizeConnections: Record<string, Sequelize> = {};

export const getSequelize = (connectionName = DEFAULT_CONNECTION_NAME) =>
  sequelizeConnections[connectionName];

export function initSequelizeTransactional(
  sequelizeConnection: Sequelize,
  connectionName = DEFAULT_CONNECTION_NAME
) {
  if (!transactionalNamespace) {
    throw new Error(
      'Sequelize CLS not enabled. Call initSequelizeCLS() before calling initSequelizeTransactional()'
    );
  }
  sequelizeConnections[connectionName] = sequelizeConnection;
}
