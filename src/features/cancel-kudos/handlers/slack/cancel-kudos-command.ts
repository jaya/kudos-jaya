/* eslint-disable @typescript-eslint/no-explicit-any */
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';
import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { CancelKudosService } from '../../services/cancel-kudos.service';
import {
  buildCancelKudosModalOptions,
  getCancelKudosView,
  groupKudosByMessage,
} from '../../ui/slack/cancel-kudos-modal';

const cancelKudosCommandHandler = withRequestContext(
  async ({ ack, body }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const userId = body.user_id;
      const service = new CancelKudosService();

      const recognitions = await service.getUserKudos(userId);

      if (recognitions.length <= 0) {
        // TODO: Implement postEphemeral in adapter
        await adapter.postMessage({
          channel: userId,
          text: 'You have no kudos to cancel.',
        });
        return;
      }

      const grouped = groupKudosByMessage(recognitions);
      const options = buildCancelKudosModalOptions(grouped);

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
