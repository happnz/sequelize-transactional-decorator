import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../../entity/comment.entity';
import { BaseService } from '../base-service';
import { PropagationNotSupported } from './propagation-not-supported';
import { setupSequelizeForTests } from '../../utils';

describe('PropagationNotSupported', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let baseService: BaseService;
  let propagationNotSupportedService: PropagationNotSupported;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    baseService = new BaseService(commentRepository);
    propagationNotSupportedService = new PropagationNotSupported(baseService);
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
      await propagationNotSupportedService.createWithoutExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 1 instance if failed after creating first one', async () => {
      try {
        await propagationNotSupportedService.createWithoutExistingTransaction(true);
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

    it('should suspend the active transaction, then create 1 instance without transaction, then commit suspended transaction with 1 instance', async () => {
      await propagationNotSupportedService.createWithExistingTransaction(true);
      const comments = await sequelize.getRepository(Comment).findAll();

      expect(comments).toHaveLength(2);
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'suspended']);
      // 'hello' was created, 'world' wasn't (due to error), which proves absence of transaction
    });

    it('should suspend the active transaction, then create 1 instance without transaction, and fail suspended transaction because of error', async () => {
      try {
        await propagationNotSupportedService.createWithExistingTransaction(true, true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();

      expect(comments).toHaveLength(1);
      expect(comments.map((a) => a.message).sort()).toEqual(['hello']);
    });
  });
});
