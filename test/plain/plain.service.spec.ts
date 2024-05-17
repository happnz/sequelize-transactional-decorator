import { PlainService } from './plain.service';
import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../entity/comment.entity';
import { setupSequelizeForTests } from '../utils';

describe('PlainService', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let plainService: PlainService;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    plainService = new PlainService(commentRepository);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await commentRepository.truncate();
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
