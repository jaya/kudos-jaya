import { TransactionController } from '@/controllers/transaction';
import logger from '@/utils/logger';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';

const generatePrizesReportCallback = async ({ ack, view, client, body }) => {
  try {
    await ack();
    const teamId = body.user.team_id;
    const userId = body.user.id;
    const startDate =
      view.state.values['report_dates']['report_start_date'].selected_date;
    const endDate =
      view.state.values['report_dates']['report_end_date'].selected_date;

    const transactions = await new TransactionController().fetchPrizesReport({
      teamId,
      start: new Date(startDate),
      end: new Date(endDate),
    });

    await writeCsv(transactions);
    const fileUrl = await uploadFile({ channelId: userId });

    await client.chat.postMessage({
      channel: userId,
      text: 'Here is the report',
      attachments: [
        {
          fallback: 'You cannot visualize the csv file.',
          text: 'Click on the file to visualize.',
          actions: [
            {
              type: 'button',
              text: 'Open',
              url: fileUrl,
            },
          ],
        },
      ],
    });
  } catch (error) {
    logger.error('generatePrizesReportCallback()', { error });
  }
};

export default generatePrizesReportCallback;
