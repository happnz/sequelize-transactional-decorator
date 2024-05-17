import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../../entity/comment.entity';
import { BaseService } from '../base-service';
import { PropagationSupports } from './propagation-supports';
import { setupSequelizeForTests } from '../../utils';

describe('PropagationSupports', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let baseService: BaseService;
  let propagationSupportsService: PropagationSupports;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    baseService = new BaseService(commentRepository);
    propagationSupportsService = new PropagationSupports(baseService);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await commentRepository.truncate();
  });

  describe('createWithoutExistingTransaction', () => {
    beforeEach(async () => {
      await commentRepository.truncate();
    });

    it('should create 2 instances without transaction', async () => {
      await propagationSupportsService.createWithoutExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 1 instance without transaction', async () => {
      try {
        await propagationSupportsService.createWithoutExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(1);
      expect(comments.map((a) => a.message).sort()).toEqual(['hello']);
    });
  });

  describe('createWithExistingTransaction', () => {
    beforeEach(async () => {
      await commentRepository.truncate();
    });

    it('should create 2 instances in transaction', async () => {
      await propagationSupportsService.createWithExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 0 instances if failed after creating first one', async () => {
      try {
        await propagationSupportsService.createWithExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });
});
