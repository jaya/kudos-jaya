import { AppDataSource } from '../data-source';
import { Wallet } from '../entity/wallet';

export class WalletController {
  private readonly walletRepository = AppDataSource.getRepository(Wallet);

  constructor() {}
  public async deposit(ownerId: string, amount: number) {
    const existWallet = await this.walletRepository.findOneBy({
      ownerId,
    });
    if (!existWallet) {
      await this.walletRepository.save({
        ownerId,
        balance: amount,
      });
      return;
    }
    existWallet.balance = existWallet.balance + amount;
    await this.walletRepository.save(existWallet);
  }

  public async withdraw() {}

  public async getBalance(ownerId: string): Promise<number> {
    const wallet = await this.walletRepository.findOneBy({ ownerId });
    return wallet.balance ?? 0;
  }
}
