/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '@/utils/logger';
import { PrizesReportService } from '../../services/prizes-report.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const generatePrizesReportViewHandler = withRequestContext(
  async ({ ack, view, body }) => {
    const userId = body.user.id;
    const teamId = body.user.team_id;

    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

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
        undefined,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await adapter.postMessage({
        channel: userId,
        text: result.message,
        blocks: result.success
          ? ([
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: 'Click on the file to visualize.',
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'Open',
                    },
                    url: result.fileUrl,
                  },
                ],
              },
            ] as any)
          : undefined,
      });
    } catch (error) {
      logger.error('generatePrizesReportViewHandler()', error);
      const context = RequestContext.get();
      const adapter = context.adapter;
      if (adapter) {
        await adapter.postMessage({
          channel: body.user.id,
          text: 'Sorry, we had a trouble generating the report',
        });
      }
    }
  },
);

export default generatePrizesReportViewHandler;
