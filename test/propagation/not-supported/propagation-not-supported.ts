import { Transactional } from '../../../dist';
import { BaseService } from '../base-service';

// Propagation NOT_SUPPORTED - Execute without transaction, suspend an active transaction if it exists.
export class PropagationNotSupported {
  constructor(
    private readonly baseService: BaseService,
  ) {}

  @Transactional({ propagation: 'NOT_SUPPORTED' })
  async createWithoutExistingTransaction(fail = false): Promise<void> {
    await this.baseService.create('hello');
    if (fail) {
      await this.baseService.throwError();
    }
    await this.baseService.create('world');
  }

  @Transactional({ propagation: 'REQUIRED' })
  async createWithExistingTransaction(fail = false, throwThrough = false): Promise<void> {
    await this.baseService.create('suspended');
    try {
      await this.createWithoutExistingTransaction(fail);
    } catch (err) {
      if (throwThrough) {
        throw err;
      }
    }
  }
}
