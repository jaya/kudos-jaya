import logger from '@/utils/logger';
import { withRequestContext } from '@/context';
import { CancelKudosService } from '../services/cancel-kudos.service';

const cancelKudosViewHandler = withRequestContext(async ({ ack, client, body, context }) => {
  try {
    await ack();

    const selectedKudos =
      body?.view?.state?.values['cancel_kudos_block']?.['cancel_kudos']
        ?.selected_options;

    if (!selectedKudos || selectedKudos.length === 0) {
      return;
    }

    const service = new CancelKudosService();

    for (const kudo of selectedKudos) {
      const kudoParams = kudo.value.split(',');
      const slackMessageId = kudoParams[0];
      const slackChannelId = kudoParams[1];

      await service.deleteKudos(slackMessageId, slackChannelId);

      try {
        await client.chat.delete({
          token: context.botToken,
          ts: slackMessageId,
          channel: slackChannelId,
        });
      } catch (err: unknown) {
        logger.error('Failed to delete Slack message', err);
      }
    }
  } catch (err: unknown) {
    logger.error('cancelKudosViewHandler()', err);
  }
});

export default cancelKudosViewHandler;
