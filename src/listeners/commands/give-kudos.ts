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
    console.error(error);
  }
};

export default giveKudosCommandCallback;
