import { TransactionController } from '@/controllers/transaction';
import logger from '@/utils/logger';
import console from 'console';

const generatePrizesReportCallback = async ({ ack, view, client, body }) => {
  try {
    await ack();
    const teamId = body.user.team_id;
    const startDate =
      view.state.values['report_dates']['report_start_date'].selected_date;
    const endDate =
      view.state.values['report_dates']['report_end_date'].selected_date;

    const transactions = await new TransactionController().fetchPrizesReport({
      teamId,
      start: new Date(startDate),
      end: new Date(endDate),
    });

    console.log(JSON.stringify(transactions));
  } catch (error) {
    logger.error('generatePrizesReportCallback()', { error });
  }
};

export default generatePrizesReportCallback;
