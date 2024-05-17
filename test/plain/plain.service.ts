import { Comment } from '../entity/comment.entity';
import { Transactional } from '../../dist';
import { Repository } from 'sequelize-typescript';

export class PlainService {
  constructor(private readonly commentRepository: Repository<Comment>) {}

  @Transactional()
  async create(fail = false): Promise<void> {
    await this.commentRepository.create({ message: 'hello' });
    await this.createAnother(fail);
  }

  private async createAnother(fail = false) {
    if (fail) {
      throw new Error('failing on purpose');
    }
    await this.commentRepository.create({ message: 'world' });
  }
}
