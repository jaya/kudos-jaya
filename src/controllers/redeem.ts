import { TodoCartoes } from '../clients/todo-cartoes/todo-cartoes';
import { EmitGiftCardPayload } from '../clients/todo-cartoes/types';
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

    const payload: EmitGiftCardPayload = {
      card_identificator: params.cardId,
      external_partner_load_id: `jayatech${id}`,
      total: params.amount,
      card_image_id: params.imageId,
    };

    const response = await new TodoCartoes().emitGiftCard(payload);

    if (response.status !== 201) {
      return {
        success: false,
        message: 'We had a problem generating your card :cry:',
      };
    }

    await this.walletController.withdraw(params.userId, params.amount);

    return {
      success: true,
      url: response.data.magic_link,
      message:
        ':tada: *Your Gift Card has arrived* :tada: \nClick to access your gift card',
    };
  }
}
