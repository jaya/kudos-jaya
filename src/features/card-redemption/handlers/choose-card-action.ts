import logger from '@/utils/logger';
import { getAmountInputView } from '../ui/amount-input-modal';

const chooseCardActionHandler = async ({ ack, client, body }) => {
  try {
    await ack();

    const values = body.actions[0].value.split(',');
    const cardId = values[0];
    const minValue = values[1];
    const maxValue = values[2];

    const view = getAmountInputView(cardId, minValue, maxValue);

    await client.views.update({
      view_id: body.view!.id,
      hash: body.view!.hash,
      view,
    });
  } catch (error) {
    logger.error('chooseCardActionHandler()', error);
  }
};

export default chooseCardActionHandler;
