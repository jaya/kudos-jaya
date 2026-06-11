import logger from '@/utils/logger';
import { RedeemGiftCardService } from '../services/redeem-gift-card.service';

const generateCardViewHandler = async ({ ack, view, client, body }) => {
  const userId = body.user.id;

  try {
    await ack();

    const cardId = body.view.private_metadata;
    const teamId = body.user.team_id;
    const amount =
      view.state.values['card_amount_block']['card_amount_value'].value;

    const service = new RedeemGiftCardService();
    const card = await service.emitGiftCard({
      userId,
      cardId,
      amount: Number(amount),
      teamId,
    });

    if (!card?.url) {
      await client.chat.postMessage({
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
        ],
      });
      return;
    }

    await client.chat.postMessage({
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
      ],
    });

    const auditors = await service.getAuditors(teamId);
    const productInfo = await service.getProductInfo(cardId);

    for (const user of auditors) {
      const productName = productInfo?.name || 'a product';
      await client.chat.postMessage({
        channel: user.id,
        text: `<@${userId}> redeemed R$${amount} in ${productName}.`,
      });
    }
  } catch (error) {
    logger.error('generateCardViewHandler()', error);
    await client.chat.postMessage({
      text: 'We had a trouble generating your gift card :cry: ',
      channel: userId,
    });
  }
};

export default generateCardViewHandler;
