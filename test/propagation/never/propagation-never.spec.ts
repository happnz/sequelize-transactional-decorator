import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../../entity/comment.entity';
import { BaseService } from '../base-service';
import { PropagationNever } from './propagation-never';
import { setupSequelizeForTests } from '../../utils';

describe('PropagationNever', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let baseService: BaseService;
  let propagationNeverService: PropagationNever;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    baseService = new BaseService(commentRepository);
    propagationNeverService = new PropagationNever(baseService);
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
      await propagationNeverService.createWithoutExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 1 instance if failed after creating first one', async () => {
      try {
        await propagationNeverService.createWithoutExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello']);
    });
  });

  describe('createWithExistingTransaction', () => {
    beforeEach(async () => {
      await commentRepository.truncate();
    });

    it('should throw error because there is an active transaction', async () => {
      try {
        await propagationNeverService.createWithExistingTransaction();
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('For transaction with Propagation.NEVER there must be no active transaction but one was not found');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });
});
