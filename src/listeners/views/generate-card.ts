import { RedeemController } from '@/controllers/redeem';

const generateGiftCardCallback = async ({ ack, view, client, body }) => {
  try {
    await ack();
    const userId = body.user.id;
    const cardId = body.view.private_metadata;
    const amount =
      view.state.values['card_amount_block']['card_amount_value'].value;

    const card = await new RedeemController().emitGiftCard({
      userId,
      amount: Number(amount),
      cardId,
    });

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
        card.url
          ? {
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
            }
          : undefined,
      ],
    });
  } catch (error) {
    console.error(error);
  }
};

export default generateGiftCardCallback;
