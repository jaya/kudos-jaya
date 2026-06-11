import logger from '@/utils/logger';
import { getPrizesReportView } from '../ui/prizes-report-modal';

const openPrizesReportHandler = async ({ ack, client, body }) => {
  try {
    await ack();

    const view = getPrizesReportView();

    await client.views.open({
      trigger_id: body.trigger_id,
      view,
    });
  } catch (error) {
    logger.error('openPrizesReportHandler()', error);
  }
};

export default openPrizesReportHandler;
