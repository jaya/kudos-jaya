import { AppDataSource } from '@/data-source';
import { Wallet } from '@/entity/wallet';

export class WalletController {
  private readonly walletRepository = AppDataSource.getRepository(Wallet);

  public async deposit(ownerId: string, amount: number): Promise<void> {
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

  public async withdraw(ownerId: string, amount: number): Promise<void> {
    const existWallet = await this.walletRepository.findOneBy({
      ownerId,
    });
    if (!existWallet) {
      return;
    }
    existWallet.balance = existWallet.balance - amount;
    await this.walletRepository.save(existWallet);
  }

  public async getBalance(ownerId: string): Promise<number> {
    const wallet = await this.walletRepository.findOneBy({ ownerId });
    return wallet?.balance ?? 0;
  }
}
