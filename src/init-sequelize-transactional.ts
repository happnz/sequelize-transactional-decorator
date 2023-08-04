import { Sequelize } from 'sequelize';
import { createNamespace } from 'cls-hooked';

export function initSequelizeCLS() {
  if (typeof Sequelize.useCLS === 'function') {
    Sequelize.useCLS(createNamespace('sequelize-transactional-namespace'));
  } else {
    throw Error('Cannot call Sequelize.useCLS (need Sequelize version 4 or later)');
  }
}

let sequelize: Sequelize;

export const getSequelize = () => sequelize;

export function initSequelizeTransactional(sequelizeConnection: Sequelize) {
  sequelize = sequelizeConnection;
}
