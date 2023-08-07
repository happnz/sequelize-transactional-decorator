import { Sequelize } from 'sequelize-typescript';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppService } from './app.service';
import { Comment } from '../entity/comment.entity';
import { initSequelizeCLS, SequelizeTransactionalModule } from '../../src';

describe('AppService', () => {
  let appService: AppService;
  let sequelize: Sequelize;

  let testingModule: TestingModule;

  beforeAll(async () => {
    initSequelizeCLS();

    testingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          logging: console.log,
          autoLoadModels: true,
        }),
        SequelizeTransactionalModule.register(),
        SequelizeModule.forFeature([Comment]),
      ],
      providers: [AppService],
    }).compile();

    appService = testingModule.get(AppService);
    sequelize = testingModule.get(Sequelize);
  });

  afterAll(async () => {
    await testingModule.close();
  });

  beforeEach(async () => {
    await Comment.truncate();
  });

  it('should create 2 instances successfully', async () => {
    await appService.create();
    const comments = await sequelize.getRepository(Comment).findAll();
    expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
  });

  it('should create 0 instances if failed after creating first one', async () => {
    try {
      await appService.create(true);
      fail('error expected');
    } catch (error) {
      expect(error.message).toEqual('failing on purpose');
    }
    const comments = await sequelize.getRepository(Comment).findAll();
    expect(comments).toHaveLength(0);
  });
});
