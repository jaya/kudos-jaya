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

  public async fetchPrizesReport(params: {
    teamId: string;
    start: Date;
    end: Date;
  }): Promise<Transaction[]> {
    try {
      return this.repository
        .createQueryBuilder('transaction')
        .select([
          'transaction.id as "id"',
          'installation.teamName as "teamName"',
          'wallet.ownerId as "ownerId"',
          'product.name as "product"',
          'transaction.amount as "amount"',
          'transaction.createdAt as "createdAt"',
        ])
        .innerJoin('transaction.installation', 'installation')
        .innerJoin('transaction.wallet', 'wallet')
        .innerJoin('transaction.product', 'product')
        .where('transaction.createdAt BETWEEN :start AND :end', {
          start: params.start,
          end: params.end,
        })
        .andWhere('transaction.teamId = :teamId', { teamId: params.teamId })
        .getRawMany();
    } catch (error) {
      logger.error('fetchPrizesReport()', error);
    }
  }
}
