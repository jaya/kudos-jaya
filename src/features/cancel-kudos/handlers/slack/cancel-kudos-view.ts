import logger from '@/utils/logger';
import { CancelKudosService } from '../../services/cancel-kudos.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const cancelKudosViewHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const selectedKudos =
      body?.view?.state?.values['cancel_kudos_block']?.['cancel_kudos']
        ?.selected_options;

    if (!selectedKudos || selectedKudos.length === 0) {
      return;
    }

    const teamId = body.user.team_id;
    const service = new CancelKudosService();

    for (const kudo of selectedKudos) {
      const kudoParams = kudo.value.split(',');
      const slackMessageId = kudoParams[0];
      const slackChannelId = kudoParams[1];

      // Delete from database
      await service.deleteKudos(teamId, slackMessageId, slackChannelId);

      // Delete from Slack
      try {
        await adapter.deleteMessage({
          ts: slackMessageId,
          channel: slackChannelId,
        });
      } catch (error) {
        logger.error('Failed to delete Slack message', error);
      }
    }
  } catch (error) {
    logger.error('cancelKudosViewHandler()', error);
  }
});

export default cancelKudosViewHandler;
