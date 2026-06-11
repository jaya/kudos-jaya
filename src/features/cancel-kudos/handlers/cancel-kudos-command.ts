import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { CancelKudosService } from '../services/cancel-kudos.service';
import {
  groupKudosByMessage,
  buildCancelKudosModalOptions,
  getCancelKudosView,
} from '../ui/cancel-kudos-modal';

const cancelKudosCommandHandler = async ({
  ack,
  client,
  body,
  context,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  try {
    await ack();

    const teamId = body.team_id;
    const userId = body.user_id;
    const service = new CancelKudosService();

    // Fetch user's kudos
    const recognitions = await service.getUserKudos(teamId, userId);

    if (recognitions.length <= 0) {
      await client.chat.postEphemeral({
        token: context.botToken,
        channel: userId,
        user: userId,
        text: 'You have no kudos to cancel.',
      });
      return;
    }

    // Build modal
    const grouped = groupKudosByMessage(recognitions);
    const options = buildCancelKudosModalOptions(grouped);

    // Open modal
    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      view: getCancelKudosView(options) as any,
    });
  } catch (error) {
    logger.error('cancelKudosCommandHandler()', error);
  }
};

export default cancelKudosCommandHandler;
