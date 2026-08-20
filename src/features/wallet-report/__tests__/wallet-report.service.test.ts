import { WalletReportService } from '../services/wallet-report.service';
import { WalletController } from '@/controllers';
import { RequestContext } from '@/context';
import * as writeCsvUtil from '@/utils/write-csv';
import * as fs from 'fs';
import * as path from 'path';

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
  const testFilePath = path.join(__dirname, '../../../assets/file.csv');

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

    service = new WalletReportService();
  });

  afterEach(() => {
    // Clean up test file if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
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
      const uploadCall = (mockAdapter.uploadFile as jest.Mock).mock.calls[0][0];
      expect(uploadCall.filename).toBe('file.csv');
      expect(uploadCall.filetype).toBe('csv');
      expect(uploadCall.channels).toEqual(['user1']);
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
