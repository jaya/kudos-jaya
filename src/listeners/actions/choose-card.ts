import logger from '@/utils/logger';

const chooseCardButtonCallback = async ({ ack, client, body }) => {
  try {
    await ack();
    const values = body.actions[0].value.split(',');
    const cardId = values[0];
    const minValue = values[1];
    const maxValue = values[2];

    await client.views.update({
      view_id: body.view!.id,
      hash: body.view!.hash,
      view: {
        type: 'modal',
        callback_id: 'generate_gift_card',
        title: {
          type: 'plain_text',
          text: 'Card redemption',
        },
        blocks: [
          {
            block_id: 'card_amount_block',
            type: 'input',
            element: {
              type: 'number_input',
              is_decimal_allowed: true,
              action_id: 'card_amount_value',
              min_value: minValue,
              max_value: maxValue,
            },
            label: {
              type: 'plain_text',
              text: 'Enter the amount you wish to redeem',
              emoji: true,
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        private_metadata: cardId,
      },
    });
  } catch (error) {
    logger.error('chooseCardButtonCallback()', { error });
  }
};

export default chooseCardButtonCallback;
