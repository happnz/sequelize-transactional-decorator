import { Sequelize } from 'sequelize-typescript';
import { Comment } from './entity/comment.entity';
import { initSequelizeCLS, initSequelizeTransactional } from '../dist';

export const setupSequelizeForTests = async (): Promise<Sequelize> => {
  initSequelizeCLS();

  const sequelizeInstance = await new Sequelize({
    dialect: 'postgres',
    database: process.env.POSTGRES_DATABASE_NAME,
    host: process.env.POSTGRES_DATABASE_HOST,
    port: Number(process.env.POSTGRES_DATABASE_PORT),
    username: process.env.POSTGRES_DATABASE_USERNAME,
    password: process.env.POSTGRES_DATABASE_PASSWORD,
    logging: false,
    models: [Comment],
  }).sync({ force: true });

  initSequelizeTransactional(sequelizeInstance);

  return sequelizeInstance;
}