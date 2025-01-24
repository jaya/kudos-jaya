import { AppDataSource } from '@/data-source';
import { Transaction } from '@/entity/transaction';
import logger from '@/utils/logger';

export class TransactionController {
  private readonly repository = AppDataSource.getRepository(Transaction);
  public async register(transaction: Partial<Transaction>): Promise<void> {
    try {
      await this.repository.save(transaction);
    } catch (error) {
      logger.error('TransactionController.register()', error);
    }
  }
}
