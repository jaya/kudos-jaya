import logger from '@/utils/logger';
import { getPrizesReportView } from '../../ui/slack/prizes-report-modal';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const openPrizesReportHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const view = getPrizesReportView();

    await adapter.openModal({
      triggerId: body.trigger_id,
      view,
    });
  } catch (error) {
    logger.error('openPrizesReportHandler()', error);
  }
});

export default openPrizesReportHandler;
