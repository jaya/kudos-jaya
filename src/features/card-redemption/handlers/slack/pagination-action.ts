import logger from '@/utils/logger';
import {
  getProductListBlocks,
  getProductListView,
} from '../../ui/slack/product-list-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const paginationActionHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const params = body.actions[0]?.selected_option?.value;
    const page = params.split(',')[1];

    const blocks = await getProductListBlocks(Number(page));
    const view = getProductListView(blocks);

    await adapter.updateModal({
      viewId: body.view!.id,
      view,
    });
  } catch (error) {
    logger.error('paginationActionHandler()', error);
  }
});

export default paginationActionHandler;
