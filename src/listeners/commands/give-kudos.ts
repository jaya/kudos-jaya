import logger from '@/utils/logger';
import { openKudosView } from '@/views/give-kudos';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

const giveKudosCommandCallback = async ({
  ack,
  client,
  body,
  context,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  try {
    await ack();
    await openKudosView({ client, body, context });
  } catch (error) {
    logger.error('giveKudosCommandCallback()', error);
  }
};

export default giveKudosCommandCallback;
