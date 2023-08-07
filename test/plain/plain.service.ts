import { Comment } from '../entity/comment.entity';
import { Transactional } from '../../src';

export class PlainService {
  constructor(private readonly commentEntity: typeof Comment) {}

  @Transactional()
  async create(fail = false): Promise<void> {
    await this.commentEntity.create({ message: 'hello' });
    await this.createAnother(fail);
  }

  private async createAnother(fail = false) {
    if (fail) {
      throw new Error('failing on purpose');
    }
    await this.commentEntity.create({ message: 'world' });
  }
}
