import generatePrizesReportViewHandler from '../../handlers/generate-prizes-report-view';
import { PrizesReportService } from '../../services/prizes-report.service';

jest.mock('../../services/prizes-report.service');
jest.mock('@/utils/logger');

describe('generatePrizesReportViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockView: any;
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
  });

  it('should generate and post prizes report successfully', async () => {
    mockService.generateReport.mockResolvedValue({
      success: true,
      message: 'Here is the report',
      fileUrl: 'https://example.com/report.csv',
    });

    await generatePrizesReportViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockView,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.generateReport).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user1',
        teamId: 'team1',
      }),
      mockClient,
    );
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
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
      client: mockClient,
      body: mockBody,
      view: mockView,
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
