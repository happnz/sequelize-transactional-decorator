import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { Transactional } from '../../src';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Comment)
    private readonly commentEntity: typeof Comment
  ) {}

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
