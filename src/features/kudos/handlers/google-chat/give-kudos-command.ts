import logger from '@/utils/logger';
import { GiveKudosService } from '../../services/give-kudos.service';
import {
  buildCompanyValueOptions,
  getKudosView,
} from '../../ui/slack/give-kudos-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

interface GoogleChatCommandParams {
  userId: string;
  triggerId: string;
}

/**
 * Google Chat: Give Kudos Command Handler
 *
 * Handles `/give-kudos` command in Google Chat spaces
 * Routes through adapter interface for platform-agnostic execution
 */
const giveKudosCommandHandler = withRequestContext(
  async ({ userId, triggerId }: GoogleChatCommandParams) => {
    try {
      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const fromId = userId;
      const service = new GiveKudosService();

      // Validate monthly limit
      const validation = await service.validateMonthlyLimit(fromId);
      if (!validation.canGive) {
        await adapter.postMessage({
          channel: userId,
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
      await adapter.openModal({
        triggerId,
        view: kudosViewRaw,
      });
    } catch (err: unknown) {
      const errorData =
        err instanceof Error
          ? { message: err.message }
          : { error: String(err) };
      logger.error('giveKudosCommandHandler(google-chat)', errorData);
    }
  },
);

export default giveKudosCommandHandler;
