import { PlainService } from './plain.service';
import { initSequelizeCLS, initSequelizeTransactional } from '../../src';
import { Sequelize } from 'sequelize-typescript';
import { Comment } from '../entity/comment.entity';

describe('PlainService', () => {
  let sequelize: Sequelize;
  let plainService: PlainService;

  beforeAll(async () => {
    initSequelizeCLS();

    sequelize = await new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: console.log,
      models: [Comment],
    }).sync({ force: true });

    initSequelizeTransactional(sequelize);

    plainService = new PlainService(Comment);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Comment.truncate();
  });

  it('should create 2 instances successfully', async () => {
    await plainService.create();
    const comments = await sequelize.getRepository(Comment).findAll();
    expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
  });

  it('should create 0 instances if failed after creating first one', async () => {
    try {
      await plainService.create(true);
      fail('error expected');
    } catch (error) {
      expect(error.message).toEqual('failing on purpose');
    }
    const comments = await sequelize.getRepository(Comment).findAll();
    expect(comments).toHaveLength(0);
  });
});
