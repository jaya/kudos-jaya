import { AppDataSource } from '../data-source';
import { Wallet } from '../entity/wallet';

export class WalletController {
  private readonly walletRepository = AppDataSource.getRepository(Wallet);

  constructor(private ownerId: string, private amount: number) {}
  public async deposit() {
    const existWallet = await this.walletRepository.findOneBy({
      ownerId: this.ownerId,
    });
    if (!existWallet) {
      await this.walletRepository.save({
        ownerId: this.ownerId,
        balance: this.amount,
      });
      return;
    }
    existWallet.balance = existWallet.balance + this.amount;
    await this.walletRepository.save(existWallet);
  }

  public async withdraw() {}
}
