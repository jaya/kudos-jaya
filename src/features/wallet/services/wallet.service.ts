import { WalletController } from '@/controllers';
import { Wallet } from '@/entities/wallet';
import { writeCsv } from '../utils/write-csv';

type BaseParams = {
  ownerId: string;
  teamId: string;
  amount?: number;
};

export class WalletService {
  private walletController: WalletController;

  constructor() {
    this.walletController = new WalletController();
  }

  public async deposit(params: BaseParams): Promise<void> {
    return this.walletController.deposit(params);
  }

  public async withdraw(params: BaseParams): Promise<void> {
    return this.walletController.withdraw(params);
  }

  public async getBalance(params: BaseParams): Promise<number> {
    return this.walletController.getBalance(params);
  }

  public async getBalanceToBeRedeemed(
    params: Omit<BaseParams, 'ownerId'>,
  ): Promise<number> {
    return this.walletController.getBalanceToBeRedeemed(params);
  }

  public async find(params: BaseParams): Promise<Partial<Wallet>> {
    return this.walletController.find(params);
  }

  public async fetchWalletReport(params: { teamId: string }) {
    return this.walletController.fetchWalletReport(params);
  }

  public async generateWalletReportCsv(data: object[]): Promise<void> {
    return writeCsv(data);
  }
}
