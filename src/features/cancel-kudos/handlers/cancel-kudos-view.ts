import logger from '@/utils/logger';
import { CancelKudosService } from '../services/cancel-kudos.service';

const cancelKudosViewHandler = async ({ ack, client, body, context }) => {
  try {
    await ack();

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
        await client.chat.delete({
          token: context.botToken,
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
};

export default cancelKudosViewHandler;
