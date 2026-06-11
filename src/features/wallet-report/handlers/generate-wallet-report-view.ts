import logger from '@/utils/logger';
import { WalletReportService } from '../services/wallet-report.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateWalletReportViewHandler = async ({ ack, client, body }: any) => {
  const userId = body.user.id;
  const teamId = body.user.team_id;

  try {
    await ack();

    const service = new WalletReportService();
    const result = await service.generateReport(
      {
        userId,
        teamId,
      },
      client,
    );

    if (result.success) {
      await client.chat.postMessage({
        channel: userId,
        text: result.message,
        attachments: [
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
        ],
      });
    } else {
      await client.chat.postMessage({
        channel: userId,
        text: result.message,
      });
    }
  } catch (error) {
    logger.error('generateWalletReportViewHandler()', error);
    await client.chat.postMessage({
      channel: body.user.id,
      text: 'Sorry, we had a trouble generating the report',
    });
  }
};

export default generateWalletReportViewHandler;
