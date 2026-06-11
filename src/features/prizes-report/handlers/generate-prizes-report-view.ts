import logger from '@/utils/logger';
import { PrizesReportService } from '../services/prizes-report.service';

const generatePrizesReportViewHandler = async ({ ack, view, client, body }) => {
  const userId = body.user.id;
  const teamId = body.user.team_id;

  try {
    await ack();

    const startDate =
      view.state.values['report_dates']['report_start_date'].selected_date;
    const endDate =
      view.state.values['report_dates']['report_end_date'].selected_date;

    const service = new PrizesReportService();
    const result = await service.generateReport(
      {
        userId,
        teamId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      client,
    );

    await client.chat.postMessage({
      channel: userId,
      text: result.message,
      attachments: result.success
        ? [
            {
              fallback: 'You cannot visualize the csv file.',
              text: 'Click on the file to visualize.',
              actions: [
                {
                  type: 'button',
                  text: 'Open',
                  url: result.fileUrl,
                },
              ],
            },
          ]
        : undefined,
    });
  } catch (error) {
    logger.error('generatePrizesReportViewHandler()', error);
    await client.chat.postMessage({
      channel: body.user.id,
      text: 'Sorry, we had a trouble generating the report',
    });
  }
};

export default generatePrizesReportViewHandler;
