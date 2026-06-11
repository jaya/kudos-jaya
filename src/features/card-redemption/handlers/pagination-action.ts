import logger from '@/utils/logger';
import {
  getProductListBlocks,
  getProductListView,
} from '../ui/product-list-modal';

const paginationActionHandler = async ({ ack, client, body }) => {
  try {
    await ack();

    const params = body.actions[0]?.selected_option?.value;
    const page = params.split(',')[1];

    const blocks = await getProductListBlocks(Number(page));
    const view = getProductListView(blocks);

    await client.views.update({
      view_id: body.view!.id,
      hash: body.view!.hash,
      view,
    });
  } catch (error) {
    logger.error('paginationActionHandler()', error);
  }
};

export default paginationActionHandler;
