import logger from '@/utils/logger';
import { getAmountInputView } from '../ui/amount-input-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const chooseCardActionHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const values = body.actions[0].value.split(',');
    const cardId = values[0];
    const minValue = values[1];
    const maxValue = values[2];

    const view = getAmountInputView(cardId, minValue, maxValue);

    await adapter.updateModal({
      viewId: body.view!.id,
      view,
    });
  } catch (error) {
    logger.error('chooseCardActionHandler()', error);
  }
});

export default chooseCardActionHandler;
