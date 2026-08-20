import logger from '@/utils/logger';
import { GiveKudosService } from '../../services/give-kudos.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const getGifActionHandler = withRequestContext(async ({ ack, body }: any) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const service = new GiveKudosService();
    const gif = await service.fetchGif();

    await adapter.updateModal({
      viewId: body.view.id,
      view: {
        type: 'modal',
        callbackId: 'give_kudos_view',
        title: 'Give someone kudos',
        blocks: [
          ...body.view.blocks.map((block: any) =>
            block.block_id === 'gif_block'
              ? {
                  type: 'image',
                  blockId: 'gif_block',
                  imageUrl: gif,
                  altText: 'Gif image that will be sent',
                }
              : block,
          ),
        ],
        submitText: 'Share',
      },
    });
  } catch (error) {
    logger.error('getGifActionHandler()', error);
  }
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export default getGifActionHandler;
