import logger from '@/utils/logger';
import {
  getProductListBlocks,
  getProductListView,
} from '../ui/product-list-modal';

const redeemButtonActionHandler = async ({ ack, client, body }) => {
  try {
    await ack();

    const blocks = await getProductListBlocks(1);
    const view = getProductListView(blocks);

    await client.views.open({
      trigger_id: body.trigger_id,
      view,
    });
  } catch (error) {
    logger.error('redeemButtonActionHandler()', error);
  }
};

export default redeemButtonActionHandler;
