import logger from '@/utils/logger';
import generateWalletReport from '../views/generate-wallet-report';

const walletReportCallback = async ({ ack, client, body }) => {
  try {
    await ack();
    await generateWalletReport({ client, body });
  } catch (error) {
    logger.error('walletReportCallback() - Error generating wallet report', {
      error,
    });
  }
};

export default walletReportCallback;
