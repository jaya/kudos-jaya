import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { GiveKudosService } from '../../services/give-kudos.service';
import {
  buildCompanyValueOptions,
  getKudosView,
} from '../../ui/slack/give-kudos-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const giveKudosCommandHandler = withRequestContext(
  async ({ ack, body }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const fromId = body.user_id;
      const service = new GiveKudosService();

      // Validate monthly limit
      const validation = await service.validateMonthlyLimit(fromId);
      if (!validation.canGive) {
        await adapter.postMessage({
          channel: fromId,
          text: validation.message || 'You cannot give kudos at this time',
        });
        return;
      }

      // Fetch GIF
      const gif = await service.fetchGif();

      // Fetch company values and monthly limit
      const companyValues = await service.getCompanyValues();
      const companyValueOptions = buildCompanyValueOptions(companyValues);

      // Open modal
      const kudosViewRaw = getKudosView(
        gif,
        companyValueOptions,
        validation.remaining,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kudosView = kudosViewRaw as any;
      await adapter.openModal({
        triggerId: body.trigger_id,
        view: kudosView,
      });
    } catch (err: unknown) {
      const errorData =
        err instanceof Error
          ? { message: err.message }
          : { error: String(err) };
      logger.error('giveKudosCommandHandler()', errorData);
    }
  },
);

export default giveKudosCommandHandler;
