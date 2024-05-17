import { Transactional } from '../../../dist';
import { BaseService } from '../base-service';

// Propagation NEVER - Execute without transaction. If an active transaction exists, throw an exception.
export class PropagationNever {
  constructor(
    private readonly baseService: BaseService,
  ) {}

  @Transactional({ propagation: 'NEVER' })
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
