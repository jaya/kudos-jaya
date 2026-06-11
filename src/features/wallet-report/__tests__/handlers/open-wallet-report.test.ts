import openWalletReportHandler from '../../handlers/open-wallet-report';
import { WalletReportService } from '../../services/wallet-report.service';

jest.mock('../../services/wallet-report.service');
jest.mock('@/utils/logger');

describe('openWalletReportHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        postMessage: jest.fn(),
      },
    };
    mockBody = {
      user: {
        id: 'user1',
        team_id: 'team1',
      },
    };

    mockService = {
      generateReport: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (WalletReportService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should generate and post wallet report successfully', async () => {
    mockService.generateReport.mockResolvedValue({
      success: true,
      message: 'Here is the report',
      fileUrl: 'https://example.com/report.csv',
    });

    await openWalletReportHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.generateReport).toHaveBeenCalledWith(
      { userId: 'user1', teamId: 'team1' },
      mockClient,
    );
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Here is the report',
        attachments: expect.any(Array),
      }),
    );
  });

  it('should post error message when report generation fails', async () => {
    mockService.generateReport.mockResolvedValue({
      success: false,
      message: 'Sorry, we had a trouble generating the report',
    });

    await openWalletReportHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Sorry, we had a trouble generating the report',
      }),
    );
  });

  it('should handle service errors gracefully', async () => {
    mockService.generateReport.mockRejectedValue(new Error('Service error'));

    await openWalletReportHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Sorry, we had a trouble generating the report',
      }),
    );
  });
});
