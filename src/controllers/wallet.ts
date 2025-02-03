import { AppDataSource } from '@/data-source';
import { Wallet } from '@/entities/wallet';

type BaseParams = {
  ownerId: string;
  teamId: string;
  amount?: number;
};
export class WalletController {
  private readonly walletRepository = AppDataSource.getRepository(Wallet);

  public async deposit(params: BaseParams): Promise<void> {
    const { ownerId, amount, teamId } = params;
    const existWallet = await this.walletRepository.findOneBy({
      ownerId,
      teamId,
    });
    if (!existWallet) {
      await this.walletRepository.save({
        ownerId,
        balance: amount,
        teamId,
      });
      return;
    }
    existWallet.balance = existWallet.balance + amount;
    await this.walletRepository.update(
      { ownerId, teamId },
      { balance: existWallet.balance }
    );
  }

  public async withdraw(params: BaseParams): Promise<void> {
    const { teamId, ownerId, amount } = params;
    const existWallet = await this.walletRepository.findOneBy({
      ownerId,
      teamId,
    });
    if (!existWallet) {
      return;
    }
    existWallet.balance = existWallet.balance - amount;
    await this.walletRepository.update(
      { ownerId, teamId },
      { balance: existWallet.balance }
    );
  }

  public async getBalance(params: BaseParams): Promise<number> {
    const { ownerId, teamId } = params;
    const wallet = await this.walletRepository.findOneBy({ ownerId, teamId });
    return wallet?.balance ?? 0;
  }

  public async getBalanceToBeRedeemed(
    params: Omit<BaseParams, 'ownerId'>
  ): Promise<number> {
    const balance = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.balance)', 'total')
      .where('wallet.teamId = :teamId', { teamId: params.teamId })
      .getRawOne();

    return balance.total ?? 0;
  }

  public async find(params: BaseParams): Promise<Partial<Wallet>> {
    const { ownerId, teamId } = params;
    return await this.walletRepository.findOneBy({ ownerId, teamId });
  }
}
