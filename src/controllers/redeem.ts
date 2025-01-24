import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { IGiftCardPayload } from '@/models/IGiftCard';
import { decrypt } from '@/utils/encrypt';
import { InstallationController } from './installation';
import { TransactionController } from './transaction';
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
  teamId: string;
};

export class RedeemController {
  private readonly walletController = new WalletController();
  private readonly transactionController = new TransactionController();

  public async emitGiftCard(params: EmitGiftCardParams): Promise<GiftCard> {
    const { userId, teamId, amount, cardId } = params;
    const { balance, id: walletId } = await this.walletController.find({
      ownerId: userId,
      teamId,
    });

    if (amount > balance) {
      return {
        success: false,
        message:
          'You cannot request a gift card with a value greater than your current balance.',
      };
    }

    const date = new Date();
    const id = date.valueOf();

    const payload: IGiftCardPayload = {
      cardId: cardId,
      transactionId: `jayatech${id}`,
      amount,
    };
    const { giftCardApiToken } = await new InstallationController().find(
      teamId
    );

    try {
      const response = await new TodoCartoes(
        undefined,
        decrypt(giftCardApiToken)
      ).emitGiftCard(payload);
      if (!response.url) {
        return {
          success: false,
          message: 'We had a problem generating your card :cry:',
        };
      }

      await this.walletController.withdraw({ ownerId: userId, teamId, amount });
      await this.transactionController.register({
        teamId,
        walletId,
        amount,
        productId: cardId,
      });

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
