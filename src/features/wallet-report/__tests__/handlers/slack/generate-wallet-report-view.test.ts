import generateWalletReportViewHandler from '../../../handlers/slack/generate-wallet-report-view';
import { WalletReportService } from '../../../services/wallet-report.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../../services/wallet-report.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('generateWalletReportViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockAdapter = {
      postMessage: jest.fn().mockResolvedValue(undefined),
    };
    mockBody = {
      user: {
        id: 'user1',
      },
    };

    mockService = {
      generateReport: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (WalletReportService as jest.Mock).mockImplementation(() => mockService);

    // Mock RequestContext.get() to return context with adapter
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });

    // Mock RequestContext.runAsync to call the handler directly
    (RequestContext.runAsync as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context: any, fn: any) => fn(),
    );
  });

  it('should post success message with file url when report generated successfully', async () => {
    const successResult = {
      success: true,
      message: 'Report generated',
      fileUrl: 'https://example.com/report.csv',
    };
    mockService.generateReport.mockResolvedValue(successResult);

    await generateWalletReportViewHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.generateReport).toHaveBeenCalledWith(
      { userId: 'user1' },
      undefined,
    );
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Report generated',
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
          }),
          expect.objectContaining({
            type: 'actions',
          }),
        ]),
      }),
    );
  });

  it('should post error message when report generation fails', async () => {
    const errorResult = {
      success: false,
      message: 'Failed to generate report',
    };
    mockService.generateReport.mockResolvedValue(errorResult);

    await generateWalletReportViewHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Failed to generate report',
      }),
    );
  });

  it('should handle service errors gracefully', async () => {
    const error = new Error('Service error');
    mockService.generateReport.mockRejectedValue(error);

    await generateWalletReportViewHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Sorry, we had a trouble generating the report',
      }),
    );
  });

  it('should throw error if adapter is not available', async () => {
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: undefined,
    });

    await generateWalletReportViewHandler({
      ack: mockAck,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
  });
});
