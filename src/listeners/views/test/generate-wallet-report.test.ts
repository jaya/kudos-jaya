import { WalletController } from '@/controllers';
import logger from '@/utils/logger';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import generateWalletReport from '../generate-wallet-report';

jest.mock('@/utils/upload-files-slack');
jest.mock('@/utils/write-csv');
jest.mock('@/utils/logger');

const mockClient = {
  chat: {
    postMessage: jest.fn(),
  },
};
const body = {
  user: {
    id: 'U12345',
    team_id: 'TEAM1234',
  },
};
const fileUrl = 'https://slack.com/my-file';

const reportData = [
  { name: 'User 1', balance: 100 },
  { name: 'User 2', balance: 50 },
];

describe('generateWalletReport()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should generate a CSV and send to the user through message', async () => {
    jest
      .spyOn(WalletController.prototype, 'fetchWalletReport')
      .mockResolvedValueOnce(reportData);
    (writeCsv as jest.Mock).mockResolvedValueOnce(undefined);
    (uploadFile as jest.Mock).mockResolvedValueOnce(fileUrl);

    await generateWalletReport({ client: mockClient, body });

    expect(writeCsv).toHaveBeenCalledWith(reportData);
    expect(uploadFile).toHaveBeenCalledWith({
      client: mockClient,
      channelId: body.user.id,
    });
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: body.user.id,
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
  });

  it('Should send a message if there is no data to generate the report', async () => {
    jest
      .spyOn(WalletController.prototype, 'fetchWalletReport')
      .mockResolvedValueOnce([]);

    await generateWalletReport({ client: mockClient, body });

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: body.user.id,
      text: 'Sorry, we do not have enough data to generate the wallet report yet.',
    });
  });

  it('Should log the error and send a message on failure', async () => {
    const error = new Error('Test error');
    jest
      .spyOn(WalletController.prototype, 'fetchWalletReport')
      .mockRejectedValueOnce(error);

    await generateWalletReport({ client: mockClient, body });

    expect(logger.error).toHaveBeenCalledWith(
      'generateWalletReport() - Error generating wallet report',
      { error },
    );
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
      channel: body.user.id,
      text: 'Sorry, we had a trouble generating the report',
    });
  });
});
