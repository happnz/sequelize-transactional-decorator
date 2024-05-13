import { Repository, Sequelize } from 'sequelize-typescript';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppService } from './app.service';
import { Comment } from '../entity/comment.entity';
import { initSequelizeCLS, SequelizeTransactionalModule } from '../../dist';

describe('AppService', () => {
  let appService: AppService;
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;

  let testingModule: TestingModule;

  beforeAll(async () => {
    initSequelizeCLS();

    testingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'postgres',
          database: process.env.POSTGRES_DATABASE_NAME,
          host: process.env.POSTGRES_DATABASE_HOST,
          port: Number(process.env.POSTGRES_DATABASE_PORT),
          username: process.env.POSTGRES_DATABASE_USERNAME,
          password: process.env.POSTGRES_DATABASE_PASSWORD,
          logging: false,
          autoLoadModels: true,
        }),
        SequelizeTransactionalModule.register(),
        SequelizeModule.forFeature([Comment]),
      ],
      providers: [AppService],
    }).compile();


    appService = testingModule.get(AppService);
    sequelize = testingModule.get(Sequelize);
    commentRepository = sequelize.getRepository(Comment);
  });

  afterAll(async () => {
    await testingModule.close();
  });

  beforeEach(async () => {
    await commentRepository.truncate();
  });

  it('should create 2 instances successfully', async () => {
    await appService.create();
    const comments = await commentRepository.findAll();
    expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
  });

  it('should create 0 instances if failed after creating first one', async () => {
    try {
      await appService.create(true);
      fail('error expected');
    } catch (error) {
      expect(error.message).toEqual('failing on purpose');
    }
    const comments = await commentRepository.findAll();
    expect(comments).toHaveLength(0);
  });
});
