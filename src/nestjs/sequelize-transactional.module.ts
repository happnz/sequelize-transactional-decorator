import { Module } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  DEFAULT_CONNECTION_NAME,
  initSequelizeTransactional,
} from '../init-sequelize-transactional';
import { InjectConnection } from '@nestjs/sequelize';

interface moduleOptions {
  connectionName: string;
}

export class SequelizeTransactionalModule {
  static register(options?: moduleOptions) {
    const connectionName = options?.connectionName || DEFAULT_CONNECTION_NAME;

    @Module({})
    class _SequelizeTransactionalModule {
      constructor(
        @InjectConnection(connectionName)
        sequelize: Sequelize
      ) {
        initSequelizeTransactional(sequelize, connectionName);
      }
    }

    return _SequelizeTransactionalModule;
  }
}
