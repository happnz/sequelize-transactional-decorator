import { Transactional } from '../../../dist';
import { BaseService } from '../base-service';

// Propagation REQUIRES_NEW - Always execute in a separate transaction, suspend an active transaction if it exists.
export class PropagationRequiresNew {
  constructor(
    private readonly baseService: BaseService,
  ) {}

  @Transactional({ propagation: 'REQUIRES_NEW' })
  async createWithoutExistingTransaction(fail = false): Promise<void> {
    await this.baseService.create('hello');
    if (fail) {
      await this.baseService.throwError();
    }
    await this.baseService.create('world');
  }

  @Transactional({ propagation: 'REQUIRED' })
  async createWithExistingTransaction(fail = false, throwThrough = false): Promise<void> {
    await this.baseService.create('outer transaction');
    try {
      await this.createWithoutExistingTransaction(fail);
    } catch (err) {
      if (throwThrough) {
        throw err;
      }
    }
  }
}
