import { PrizesReportService } from '../services/prizes-report.service';
import { TransactionController } from '@/controllers/transaction';
import { RequestContext } from '@/context';
import * as writeCsvUtil from '@/utils/write-csv';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('@/controllers/transaction');
jest.mock('@/utils/write-csv');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('PrizesReportService', () => {
  let service: PrizesReportService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockTransactionController: any;
  const testFilePath = path.join(__dirname, '../../../assets/file.csv');

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = {
      uploadFile: jest.fn(),
    };

    mockTransactionController = {
      fetchPrizesReport: jest.fn(),
    };

    (TransactionController as jest.Mock).mockImplementation(
      () => mockTransactionController,
    );

    // Ensure assets directory exists
    const assetDir = path.dirname(testFilePath);
    if (!fs.existsSync(assetDir)) {
      fs.mkdirSync(assetDir, { recursive: true });
    }

    (writeCsvUtil.writeCsv as jest.Mock).mockImplementation(async () => {
      // Create the test file so fs.createReadStream can read it
      fs.writeFileSync(testFilePath, 'test data');
    });
    mockAdapter.uploadFile.mockResolvedValue({
      fileId: 'f123',
      url: 'https://example.com/report.csv',
    });

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team1',
      adapter: mockAdapter,
    });

    service = new PrizesReportService();
  });

  afterEach(() => {
    // Clean up test file if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
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

      const result = await service.generateReport({
        userId: 'user1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Here is the report');
      expect(result.fileUrl).toBe('https://example.com/report.csv');
      expect(writeCsvUtil.writeCsv).toHaveBeenCalledWith(mockTransactions);
      const uploadCall = (mockAdapter.uploadFile as jest.Mock).mock.calls[0][0];
      expect(uploadCall.filename).toBe('file.csv');
      expect(uploadCall.filetype).toBe('csv');
      expect(uploadCall.channels).toEqual(['user1']);
    });

    it('should return error when no data available', async () => {
      mockTransactionController.fetchPrizesReport.mockResolvedValue([]);

      const result = await service.generateReport({
        userId: 'user1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('do not have enough data');
    });

    it('should handle errors gracefully', async () => {
      mockTransactionController.fetchPrizesReport.mockRejectedValue(
        new Error('DB error'),
      );

      const result = await service.generateReport({
        userId: 'user1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('trouble generating the report');
    });
  });
});
