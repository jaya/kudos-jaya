import { RedeemController } from '@/controllers/redeem';
import { ProductController } from '@/controllers/product';
import { UserController } from '@/controllers/user';
import logger from '@/utils/logger';
import { RequestContext } from '@/context';
import { GiftCardResult, RedeemGiftCardRequest } from '../types';

export class RedeemGiftCardService {
  private readonly redeemController = new RedeemController();
  private readonly productController = new ProductController();
  private readonly userController = new UserController();

  async emitGiftCard(
    params: Omit<RedeemGiftCardRequest, 'teamId'>,
  ): Promise<GiftCardResult> {
    try {
      const { teamId } = RequestContext.get();
      const result = await this.redeemController.emitGiftCard({
        userId: params.userId,
        cardId: params.cardId,
        amount: params.amount,
        teamId,
      });
      return {
        success: result.success,
        url: result.url,
        message: result.message || 'Card processing completed',
      };
    } catch (error) {
      logger.error('RedeemGiftCardService.emitGiftCard()', error);
      return {
        success: false,
        message: 'We had a problem generating your card :cry:',
      };
    }
  }

  async getProductInfo(cardId: string): Promise<{ name: string } | null> {
    try {
      const [product] = await this.productController.get(0, 1, { id: cardId });
      return product ? { name: product.name || '' } : null;
    } catch (error) {
      logger.error('RedeemGiftCardService.getProductInfo()', error);
      return null;
    }
  }

  async getAuditors(): Promise<Array<{ id: string }>> {
    try {
      const { teamId } = RequestContext.get();
      const auditors = await this.userController.findMany({
        teamId,
        params: { isAuditor: true },
      });
      return auditors.map((user) => ({ id: user.id || '' }));
    } catch (error) {
      logger.error('RedeemGiftCardService.getAuditors()', error);
      return [];
    }
  }
}
