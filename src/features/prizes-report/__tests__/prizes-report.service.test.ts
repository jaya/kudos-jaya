import { PrizesReportService } from '../services/prizes-report.service';
import { TransactionController } from '@/controllers/transaction';
import { RequestContext } from '@/context';
import * as uploadFilesSlack from '@/utils/upload-files-slack';
import * as writeCsvUtil from '@/utils/write-csv';

jest.mock('@/controllers/transaction');
jest.mock('@/utils/upload-files-slack');
jest.mock('@/utils/write-csv');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('PrizesReportService', () => {
  let service: PrizesReportService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockTransactionController: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {};

    mockTransactionController = {
      fetchPrizesReport: jest.fn(),
    };

    (TransactionController as jest.Mock).mockImplementation(
      () => mockTransactionController,
    );
    (writeCsvUtil.writeCsv as jest.Mock).mockResolvedValue(undefined);
    (uploadFilesSlack.uploadFile as jest.Mock).mockResolvedValue(
      'https://example.com/report.csv',
    );

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team1',
    });

    service = new PrizesReportService();
  });

  describe('generateReport', () => {
    it('should generate report successfully', async () => {
      const mockTransactions = [
        { productId: 'prod1', amount: 100 },
        { productId: 'prod2', amount: 200 },
      ];

      mockTransactionController.fetchPrizesReport.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.generateReport(
        {
          userId: 'user1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        mockClient,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Here is the report');
      expect(result.fileUrl).toBe('https://example.com/report.csv');
      expect(writeCsvUtil.writeCsv).toHaveBeenCalledWith(mockTransactions);
    });

    it('should return error when no data available', async () => {
      mockTransactionController.fetchPrizesReport.mockResolvedValue([]);

      const result = await service.generateReport(
        {
          userId: 'user1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        mockClient,
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('do not have enough data');
    });

    it('should handle errors gracefully', async () => {
      mockTransactionController.fetchPrizesReport.mockRejectedValue(
        new Error('DB error'),
      );

      const result = await service.generateReport(
        {
          userId: 'user1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
        mockClient,
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('trouble generating the report');
    });
  });
});
