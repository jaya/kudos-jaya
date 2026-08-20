/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { CancelKudosService } from '../../services/cancel-kudos.service';
import {
  groupKudosByMessage,
  buildCancelKudosModalOptions,
  getCancelKudosView,
} from '../../ui/slack/cancel-kudos-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const cancelKudosCommandHandler = withRequestContext(
  async ({
    ack,
    body,
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const teamId = body.team_id;
      const userId = body.user_id;
      const service = new CancelKudosService();

      // Fetch user's kudos
      const recognitions = await service.getUserKudos(teamId, userId);

      if (recognitions.length <= 0) {
        // TODO: Implement postEphemeral in adapter
        // For now, use postMessage
        await adapter.postMessage({
          channel: userId,
          text: 'You have no kudos to cancel.',
        });
        return;
      }

      // Build modal
      const grouped = groupKudosByMessage(recognitions);
      const options = buildCancelKudosModalOptions(grouped);

      // Open modal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await adapter.openModal({
        triggerId: body.trigger_id,
        view: getCancelKudosView(options) as any,
      });
    } catch (error) {
      logger.error('cancelKudosCommandHandler()', error);
    }
  },
);

export default cancelKudosCommandHandler;
