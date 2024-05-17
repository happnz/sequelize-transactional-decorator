import { Transactional } from '../../../dist';
import { BaseService } from '../base-service';

// Propagation SUPPORTS - If exists, use current transaction, otherwise execute without transaction.
export class PropagationSupports {
  constructor(
    private readonly baseService: BaseService,
  ) {}

  @Transactional({ propagation: 'SUPPORTS' })
  async createWithoutExistingTransaction(fail = false): Promise<void> {
    await this.baseService.create('hello');
    if (fail) {
      await this.baseService.throwError();
    }
    await this.baseService.create('world');
  }

  @Transactional({ propagation: 'REQUIRED' })
  async createWithExistingTransaction(fail = false): Promise<void> {
    await this.createWithoutExistingTransaction(fail);
  }
}
