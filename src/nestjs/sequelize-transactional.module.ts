import { Module } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { initSequelizeTransactional } from '../init-sequelize-transactional';
import { InjectConnection } from '@nestjs/sequelize';

interface moduleOptions {
  connectionName: string;
}

const NEST_SEQUELIZE_DEFAULT_CONNECTION_NAME = 'default';

export class SequelizeTransactionalModule {
  static register(options?: moduleOptions) {
    const connectionName = options?.connectionName || NEST_SEQUELIZE_DEFAULT_CONNECTION_NAME;

    @Module({})
    class _SequelizeTransactionalModule {
      constructor(
        @InjectConnection(connectionName)
        sequelize: Sequelize
      ) {
        initSequelizeTransactional(sequelize);
      }
    }

    return _SequelizeTransactionalModule;
  }
}
