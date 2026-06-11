export function getAmountInputView(
  cardId: string,
  minValue: string,
  maxValue: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return {
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
  };
}
