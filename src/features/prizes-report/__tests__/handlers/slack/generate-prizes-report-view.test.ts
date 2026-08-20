import generatePrizesReportViewHandler from '../../../handlers/slack/generate-prizes-report-view';
import { PrizesReportService } from '../../../services/prizes-report.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../../services/prizes-report.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('generatePrizesReportViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockView: any;
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
        team_id: 'team1',
      },
    };
    mockView = {
      state: {
        values: {
          report_dates: {
            report_start_date: {
              selected_date: '2024-01-01',
            },
            report_end_date: {
              selected_date: '2024-12-31',
            },
          },
        },
      },
    };

    mockService = {
      generateReport: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (PrizesReportService as jest.Mock).mockImplementation(() => mockService);

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

  it('should generate and post prizes report successfully', async () => {
    mockService.generateReport.mockResolvedValue({
      success: true,
      message: 'Here is the report',
      fileUrl: 'https://example.com/report.csv',
    });

    await generatePrizesReportViewHandler({
      ack: mockAck,
      body: mockBody,
      view: mockView,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.generateReport).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user1',
      }),
    );
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Here is the report',
      }),
    );
  });

  it('should post error message when report generation fails', async () => {
    mockService.generateReport.mockResolvedValue({
      success: false,
      message: 'Sorry, we had a trouble generating the report',
    });

    await generatePrizesReportViewHandler({
      ack: mockAck,
      body: mockBody,
      view: mockView,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Sorry, we had a trouble generating the report',
      }),
    );
  });
});
