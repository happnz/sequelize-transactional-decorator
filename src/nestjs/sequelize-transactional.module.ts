import { Module, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { initSequelizeTransactional } from '../init-sequelize-transactional';

@Module({})
export class SequelizeTransactionalModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) {}

  onModuleInit() {
    initSequelizeTransactional(this.sequelize);
  }
}
