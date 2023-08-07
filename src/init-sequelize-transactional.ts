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

export const CONNECTION_NAME = 'primary';

const sequelizeConnections: Record<string, Sequelize> = {};

export const getSequelize = () => sequelizeConnections[CONNECTION_NAME];

export function initSequelizeTransactional(sequelizeConnection: Sequelize) {
  if (!transactionalNamespace) {
    throw new Error(
      'Sequelize CLS not enabled. Call initSequelizeCLS() before calling initSequelizeTransactional()'
    );
  }
  sequelizeConnections[CONNECTION_NAME] = sequelizeConnection;
}
