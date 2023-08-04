import { Sequelize } from 'sequelize';

let sequelize: Sequelize;

export const getSequelize = () => sequelize;

export function initSequelizeTransactional(sequelizeConnection: Sequelize) {
  sequelize = sequelizeConnection;
}
