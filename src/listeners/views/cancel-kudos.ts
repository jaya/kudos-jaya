import { RecognitionController } from '@/controllers';
import logger from '@/utils/logger';

const cancelKudosCallback = async ({ ack, client, body, context }) => {
  try {
    await ack();

    const selectedKudos =
      body?.view?.state?.values['cancel_kudos_block']?.['cancel_kudos']
        ?.selected_options;

    const teamId = body.user.team_id;
    for (const kudo of selectedKudos) {
      const kudoParams = kudo.value.split(',');
      const slackMessageId = kudoParams[0];
      const slackChannelId = kudoParams[1];
      await new RecognitionController().delete({
        teamId,
        params: { slackChannelId, slackMessageId },
      });

      await client.chat.delete({
        token: context.botToken,
        ts: slackMessageId,
        channel: slackChannelId,
      });
    }
  } catch (error) {
    logger.error('cancelKudosButtonCallback()', { error });
  }
};

export default cancelKudosCallback;
