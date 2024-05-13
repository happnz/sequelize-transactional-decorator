import { Repository, Sequelize } from 'sequelize-typescript';
import { Comment } from '../../entity/comment.entity';
import { BaseService } from '../base-service';
import { PropagationMandatory } from './propagation-mandatory';
import { setupSequelizeForTests } from '../../utils';

describe('PropagationMandatory', () => {
  let sequelize: Sequelize;
  let commentRepository: Repository<Comment>;
  let baseService: BaseService;
  let propagationMandatoryService: PropagationMandatory;

  beforeAll(async () => {
    sequelize = await setupSequelizeForTests();

    commentRepository = sequelize.getRepository(Comment);
    baseService = new BaseService(commentRepository);
    propagationMandatoryService = new PropagationMandatory(baseService);
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

    it('should throw error because there is no transaction', async () => {
      try {
        await propagationMandatoryService.createWithoutExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('For transaction with Propagation.MANDATORY active transaction is required but was not found');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });

  describe('createWithExistingTransaction', () => {
    beforeEach(async () => {
      await commentRepository.truncate();
    });

    it('should create 2 instances in transaction', async () => {
      await propagationMandatoryService.createWithExistingTransaction();
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments.map((a) => a.message).sort()).toEqual(['hello', 'world']);
    });

    it('should create 0 instances if failed after creating first one', async () => {
      try {
        await propagationMandatoryService.createWithExistingTransaction(true);
        fail('error expected');
      } catch (error) {
        expect(error.message).toEqual('failing on purpose');
      }
      const comments = await sequelize.getRepository(Comment).findAll();
      expect(comments).toHaveLength(0);
    });
  });
});
