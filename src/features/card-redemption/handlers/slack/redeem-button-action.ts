import logger from '@/utils/logger';
import {
  getProductListBlocks,
  getProductListView,
} from '../../ui/slack/product-list-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const redeemButtonActionHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const blocks = await getProductListBlocks(1);
    const view = getProductListView(blocks);

    await adapter.openModal({
      triggerId: body.trigger_id,
      view,
    });
  } catch (error) {
    logger.error('redeemButtonActionHandler()', error);
  }
});

export default redeemButtonActionHandler;
