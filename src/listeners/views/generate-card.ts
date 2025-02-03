import { RedeemController } from '@/controllers/redeem';
import logger from '@/utils/logger';

const generateGiftCardCallback = async ({ ack, view, client, body }) => {
  const userId = body.user.id;
  try {
    await ack();
    const cardId = body.view.private_metadata;
    const teamId = body.user.team_id;
    const amount =
      view.state.values['card_amount_block']['card_amount_value'].value;

    const card = await new RedeemController().emitGiftCard({
      userId,
      amount: Number(amount),
      cardId,
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
              text: card?.message,
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
              url: card?.url,
            },
          ],
        },
      ],
    });
  } catch (error) {
    logger.error('generateGiftCardCallback()', { error });
    await client.chat.postMessage({
      text: 'We had a trouble generating your gift card :cry: ',
      channel: userId,
    });
  }
};

export default generateGiftCardCallback;
