import logger from '@/utils/logger';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import { WalletController } from '../../controllers';

const generateWalletReport = async ({ client, body }) => {
  const userId = body.user.id;
  const teamId = body.user.team_id;

  try {
    const reportData = await new WalletController().fetchWalletReport({
      teamId,
    });

    if (reportData.length === 0) {
      await client.chat.postMessage({
        channel: userId,
        text: 'Sorry, we do not have enough data to generate the wallet report yet.',
      });
      return;
    }

    await writeCsv(reportData);
    const fileUrl = await uploadFile({ client, channelId: userId });

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
    await client.chat.postMessage({
      channel: userId,
      text: 'Sorry, we had a trouble generating the report',
    });
    logger.error('generateWalletReport() - Error generating wallet report', {
      error,
    });
  }
};

export default generateWalletReport;
