import { Sequelize } from 'sequelize';
import { createNamespace } from 'cls-hooked';

export function initSequelizeCLS() {
  if (typeof Sequelize.useCLS === 'function') {
    Sequelize.useCLS(createNamespace('sequelize-transactional-namespace'));
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
  sequelizeConnections[connectionName] = sequelizeConnection;
}
