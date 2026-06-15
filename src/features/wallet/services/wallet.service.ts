import { WalletController } from '@/controllers';
import { Wallet } from '@/entities/wallet';
import { RequestContext } from '@/context';
import { writeCsv } from '../utils/write-csv';

type BaseParams = {
  ownerId: string;
  amount?: number;
};

export class WalletService {
  private walletController: WalletController;

  constructor() {
    this.walletController = new WalletController();
  }

  public async deposit(params: BaseParams): Promise<void> {
    const { teamId } = RequestContext.get();
    return this.walletController.deposit({ ...params, teamId });
  }

  public async withdraw(params: BaseParams): Promise<void> {
    const { teamId } = RequestContext.get();
    return this.walletController.withdraw({ ...params, teamId });
  }

  public async getBalance(params: BaseParams): Promise<number> {
    const { teamId } = RequestContext.get();
    return this.walletController.getBalance({ ...params, teamId });
  }

  public async getBalanceToBeRedeemed(
    params: { amount?: number },
  ): Promise<number> {
    const { teamId } = RequestContext.get();
    return this.walletController.getBalanceToBeRedeemed({
      ...params,
      teamId,
    });
  }

  public async find(params: BaseParams): Promise<Partial<Wallet>> {
    const { teamId } = RequestContext.get();
    return this.walletController.find({ ...params, teamId });
  }

  public async fetchWalletReport(): Promise<any> {
    const { teamId } = RequestContext.get();
    return this.walletController.fetchWalletReport({ teamId });
  }

  public async generateWalletReportCsv(data: object[]): Promise<void> {
    return writeCsv(data);
  }
}
