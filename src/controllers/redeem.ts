import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { IGiftCardPayload } from '@/models/IGiftCard';
import { WalletController } from './wallet';

type GiftCard = {
  success: boolean;
  url?: string;
  message?: string;
};

type EmitGiftCardParams = {
  userId: string;
  cardId: string;
  amount: number;
  imageId?: string;
};

export class RedeemController {
  private readonly walletController = new WalletController();

  public async emitGiftCard(params: EmitGiftCardParams): Promise<GiftCard> {
    const balance = await this.walletController.getBalance(params.userId);

    if (params.amount > balance) {
      return {
        success: false,
        message:
          'You cannot request a gift card with a value greater than your current balance.',
      };
    }

    const date = new Date();
    const id = date.valueOf();

    const payload: IGiftCardPayload = {
      cardId: params.cardId,
      transactionId: `jayatech${id}`,
      amount: params.amount,
    };

    try {
      const response = await new TodoCartoes().emitGiftCard(payload);
      if (!response.url) {
        return {
          success: false,
          message: 'We had a problem generating your card :cry:',
        };
      }

      await this.walletController.withdraw(params.userId, params.amount);
      return {
        success: true,
        url: response.url,
        message:
          ':tada: *Your Gift Card has arrived* :tada: \nClick to access your gift card',
      };
    } catch (error) {
      return {
        success: false,
        message: 'We had a problem generating your card :cry:',
      };
    }
  }
}
