import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { GiveKudosService } from '../services/give-kudos.service';
import { buildCompanyValueOptions, getKudosView } from '../ui/give-kudos-modal';
import { withRequestContext } from '@/context';

const giveKudosCommandHandler = withRequestContext(
  async ({
    ack,
    client,
    body,
    context,
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
    try {
      await ack();

      const fromId = body.user_id;
      const service = new GiveKudosService();

      // Validate monthly limit
      const validation = await service.validateMonthlyLimit(fromId);
      if (!validation.canGive) {
        await client.chat.postMessage({
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
      await client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        view: getKudosView(gif, companyValueOptions, validation.remaining) as any,
      });
    } catch (err: unknown) {
      logger.error('giveKudosCommandHandler()', err);
    }
  },
);

export default giveKudosCommandHandler;
