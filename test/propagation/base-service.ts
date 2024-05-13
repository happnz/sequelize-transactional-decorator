import { Comment } from '../entity/comment.entity';
import { Repository } from 'sequelize-typescript';

export class BaseService {
  constructor(private readonly commentRepository: Repository<Comment>) {}

  async create(message: string): Promise<void> {
    await this.commentRepository.create({ message });
  }

  async throwError() {
    throw new Error('failing on purpose');
  }
}
