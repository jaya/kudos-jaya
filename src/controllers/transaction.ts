import { AppDataSource } from '@/data-source';
import { Transaction } from '@/entities/';
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
    return this.repository
      .createQueryBuilder('transaction')
      .select([
        'transaction.id as "id"',
        'installation.teamName as "teamName"',
        'wallet.ownerId as "ownerId"',
        'user.name as "name"',
        'product.name as "product"',
        'transaction.amount as "amount"',
        'transaction.createdAt as "createdAt"',
      ])
      .innerJoin('transaction.installation', 'installation')
      .innerJoin('transaction.wallet', 'wallet')
      .innerJoin('transaction.product', 'product')
      .innerJoin('wallet.user', 'user')
      .where('transaction.createdAt BETWEEN :start AND :end', {
        start: params.start,
        end: params.end,
      })
      .andWhere('transaction.teamId = :teamId', { teamId: params.teamId })
      .getRawMany();
  }

  public async redeemed(params: {
    teamId: string;
    start?: Date;
    end?: Date;
  }): Promise<number> {
    const { teamId, start, end } = params;

    const query = this.repository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.teamId = :teamId', { teamId });

    if (start && end) {
      query.andWhere('transaction.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    const redeemed = await query.getRawOne();
    return redeemed.total ?? 0;
  }
}
