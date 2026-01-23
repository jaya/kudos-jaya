import logger from '@/utils/logger';
import generateWalletReport from '../../views/generate-wallet-report';
import walletReportCallback from '../wallet-report';

jest.mock('@/utils/logger');
jest.mock('../../views/generate-wallet-report');

const ack = jest.fn();
const client = {};
const body = {};

describe('walletReportCallback()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should call generateWalletReport successfully', async () => {
    await walletReportCallback({ ack, client, body });
    expect(ack).toHaveBeenCalled();
    expect(generateWalletReport).toHaveBeenCalledWith({
      client,
      body,
    });
  });

  it('Should log the error when generateWalletReport fails', async () => {
    const error = new Error('Test error');
    (generateWalletReport as jest.Mock).mockRejectedValueOnce(error);
    await walletReportCallback({ ack, client, body });
    expect(logger.error).toHaveBeenCalledWith(
      'walletReportCallback() - Error generating wallet report',
      {
        error,
      },
    );
  });
});
