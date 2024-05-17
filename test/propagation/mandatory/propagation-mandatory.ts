import { Transactional } from '../../../dist';
import { BaseService } from '../base-service';

// Propagation MANDATORY - If exists, use current transaction, otherwise throw an exception.
export class PropagationMandatory {
  constructor(
    private readonly baseService: BaseService,
  ) {}

  @Transactional({ propagation: 'MANDATORY' })
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
