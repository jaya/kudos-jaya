import logger from '@/utils/logger';
import { WalletReportService } from '../services/wallet-report.service';

const openWalletReportHandler = async ({ ack, client, body }) => {
  const userId = body.user.id;
  const teamId = body.user.team_id;

  try {
    await ack();

    const service = new WalletReportService();
    const result = await service.generateReport({ userId, teamId }, client);

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
    logger.error('openWalletReportHandler()', error);
    await client.chat.postMessage({
      channel: body.user.id,
      text: 'Sorry, we had a trouble generating the report',
    });
  }
};

export default openWalletReportHandler;
