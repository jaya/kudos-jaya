import { WalletReportService } from '../services/wallet-report.service';
import { WalletController } from '@/controllers';
import { RequestContext } from '@/context';
import * as writeCsvUtil from '@/utils/write-csv';

jest.mock('@/controllers');
jest.mock('@/utils/write-csv');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('WalletReportService', () => {
  let service: WalletReportService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockWalletController: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = {
      uploadFile: jest.fn(),
    };

    mockWalletController = {
      fetchWalletReport: jest.fn(),
    };

    (WalletController as jest.Mock).mockImplementation(
      () => mockWalletController,
    );
    (writeCsvUtil.writeCsv as jest.Mock).mockResolvedValue(undefined);
    mockAdapter.uploadFile.mockResolvedValue({
      fileId: 'f123',
      url: 'https://example.com/report.csv',
    });

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team1',
      adapter: mockAdapter,
    });

    service = new WalletReportService();
  });

  describe('generateReport', () => {
    it('should generate report successfully', async () => {
      const mockReportData = [
        { userId: 'user1', amount: 100 },
        { userId: 'user2', amount: 200 },
      ];

      mockWalletController.fetchWalletReport.mockResolvedValue(mockReportData);

      const result = await service.generateReport({
        userId: 'user1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Here is the report');
      expect(result.fileUrl).toBe('https://example.com/report.csv');
      expect(writeCsvUtil.writeCsv).toHaveBeenCalledWith(mockReportData);
      expect(mockAdapter.uploadFile).toHaveBeenCalledWith({
        filename: 'file.csv',
        filetype: 'csv',
        channels: ['user1'],
        file: 'dist/src/assets/file.csv',
      });
    });

    it('should return error when no data available', async () => {
      mockWalletController.fetchWalletReport.mockResolvedValue([]);

      const result = await service.generateReport({
        userId: 'user1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('do not have enough data');
      expect(result.fileUrl).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockWalletController.fetchWalletReport.mockRejectedValue(
        new Error('DB error'),
      );

      const result = await service.generateReport({
        userId: 'user1',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('trouble generating the report');
    });
  });
});
