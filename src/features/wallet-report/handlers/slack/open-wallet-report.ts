/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '@/utils/logger';
import { WalletReportService } from '../../services/wallet-report.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const openWalletReportHandler = withRequestContext(async ({ ack, body }) => {
  const userId = body.user.id;
  const teamId = body.user.team_id;

  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const service = new WalletReportService();
    // TODO: Update service to accept adapter instead of client
    // For now, we'll keep passing undefined and the service will handle it
    const result = await service.generateReport({ userId, teamId }, undefined);

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
    logger.error('openWalletReportHandler()', error);
    const context = RequestContext.get();
    const adapter = context.adapter;
    if (adapter) {
      await adapter.postMessage({
        channel: body.user.id,
        text: 'Sorry, we had a trouble generating the report',
      });
    }
  }
});

export default openWalletReportHandler;
