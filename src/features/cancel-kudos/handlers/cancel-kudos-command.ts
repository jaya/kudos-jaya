import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { withRequestContext } from '@/context';
import { CancelKudosService } from '../services/cancel-kudos.service';
import {
  groupKudosByMessage,
  buildCancelKudosModalOptions,
  getCancelKudosView,
} from '../ui/cancel-kudos-modal';

const cancelKudosCommandHandler = withRequestContext(
  async ({
    ack,
    client,
    body,
    context,
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
    try {
      await ack();

      const userId = body.user_id;
      const service = new CancelKudosService();

      const recognitions = await service.getUserKudos(userId);

      if (recognitions.length <= 0) {
        await client.chat.postEphemeral({
          token: context.botToken,
          channel: userId,
          user: userId,
          text: 'You have no kudos to cancel.',
        });
        return;
      }

      const grouped = groupKudosByMessage(recognitions);
      const options = buildCancelKudosModalOptions(grouped);

      await client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        view: getCancelKudosView(options) as any,
      });
    } catch (err: unknown) {
      logger.error('cancelKudosCommandHandler()', err);
    }
  },
);

export default cancelKudosCommandHandler;
