import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../../entity/comment.entity';
import { BaseService } from '../base-service';
import { PropagationRequiresNew } from './propagation-requires-new';
import { setupSequelizeForTests } from '../../utils';

describe('PropagationRequiresNew', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let baseService: BaseService;
  let propagationRequiresNewService: PropagationRequiresNew;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    baseService = new BaseService(commentRepository);
    propagationRequiresNewService = new PropagationRequiresNew(baseService);
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

    it('should create 2 instances in transaction', async () => {
      await propagationRequiresNewService.createWithoutExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 0 instances if failed after creating first one', async () => {
      try {
        await propagationRequiresNewService.createWithoutExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });

  describe('createWithExistingTransaction', () => {
    beforeEach(async () => {
      await commentRepository.truncate();
    });

    it('should create new transaction and create 2 instances inside', async () => {
      await propagationRequiresNewService.createWithExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(3);
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'outer transaction', 'world']);
    });

    it('should create new transaction and create 0 instances inside if failed after first one, and commit outer transaction', async () => {
      await propagationRequiresNewService.createWithExistingTransaction(true);
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(1);
      expect(comments.map((a) => a.message).sort()).toEqual(['outer transaction']);
    });

    it('should create new transaction and create 0 instances inside if failed after first one, and also 0 instances in failed outer transaction', async () => {
      try {
        await propagationRequiresNewService.createWithExistingTransaction(true, true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });

});
