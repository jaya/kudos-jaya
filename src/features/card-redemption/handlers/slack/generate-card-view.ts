/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '@/utils/logger';
import { RedeemGiftCardService } from '../../services/redeem-gift-card.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const generateCardViewHandler = withRequestContext(
  async ({ ack, view, body }) => {
    const userId = body.user.id;

    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const cardId = body.view.private_metadata;
      const amount =
        view.state.values['card_amount_block']['card_amount_value'].value;

      const service = new RedeemGiftCardService();
      const card = await service.emitGiftCard({
        userId,
        cardId,
        amount: Number(amount),
      });

      if (!card?.url) {
        await adapter.postMessage({
          text: card.message,
          channel: userId,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: card.message,
              },
            },
          ] as any,
        });
        return;
      }

      await adapter.postMessage({
        text: card.message,
        channel: userId,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Click the button below to access your gift card',
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Gift Card',
                },
                url: card.url,
              },
            ],
          },
        ] as any,
      });

      const auditors = await service.getAuditors();
      const productInfo = await service.getProductInfo(cardId);

      for (const user of auditors) {
        const productName = productInfo?.name || 'a product';
        await adapter.postMessage({
          channel: user.id,
          text: `<@${userId}> redeemed R$${amount} in ${productName}.`,
        });
      }
    } catch (error) {
      logger.error('generateCardViewHandler()', error);
      const context = RequestContext.get();
      const adapter = context.adapter;
      if (adapter) {
        await adapter.postMessage({
          text: 'We had a trouble generating your gift card :cry: ',
          channel: userId,
        });
      }
    }
  },
);

export default generateCardViewHandler;
