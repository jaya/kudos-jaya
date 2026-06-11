import logger from '@/utils/logger';
import { GiveKudosService } from '../services/give-kudos.service';

const getGifActionHandler = async ({ client, body, context, ack }) => {
  try {
    await ack();

    const service = new GiveKudosService();
    const gif = await service.fetchGif();

    await client.views.update({
      token: context.botToken,
      view_id: body.view.id,
      view: {
        type: 'modal',
        callback_id: 'give_kudos_view',
        title: {
          type: 'plain_text',
          text: 'Give someone kudos',
        },
        blocks: [
          ...body.view.blocks.map((block) =>
            block.block_id === 'gif_block'
              ? {
                  type: 'image',
                  block_id: 'gif_block',
                  image_url: gif,
                  alt_text: 'Gif image that will be sent',
                }
              : block,
          ),
        ],
        submit: {
          type: 'plain_text',
          text: 'Share',
        },
      },
    });
  } catch (error) {
    logger.error('getGifActionHandler()', error);
  }
};

export default getGifActionHandler;
