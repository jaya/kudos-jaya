import * as fs from 'fs';
import * as path from 'path';
import { TransactionController } from '@/controllers/transaction';
import { RequestContext } from '@/context';
import { writeCsv } from '@/utils/write-csv';
import logger from '@/utils/logger';
import { PrizesReportParams, PrizesReportResult } from '../types';

export class PrizesReportService {
  async generateReport(
    params: Omit<PrizesReportParams, 'teamId'>,
  ): Promise<PrizesReportResult> {
    const { userId, startDate, endDate } = params;
    const { teamId, adapter } = RequestContext.get();

    try {
      if (!adapter) {
        throw new Error('Platform adapter not available');
      }

      const transactions = await new TransactionController().fetchPrizesReport({
        teamId,
        start: startDate,
        end: endDate,
      });

      if (transactions.length === 0) {
        return {
          success: false,
          message:
            'Sorry, we do not have enough data to generate the report yet',
        };
      }

      await writeCsv(transactions);
      const filePath = path.join(__dirname, '../../../assets/file.csv');
      const fileStream = fs.createReadStream(filePath);
      const result = await adapter.uploadFile({
        filename: 'file.csv',
        filetype: 'csv',
        channels: [userId],
        file: fileStream,
      });
      const fileUrl = result.url;
      fs.unlinkSync(filePath);

      return {
        success: true,
        message: 'Here is the report',
        fileUrl,
      };
    } catch (error) {
      logger.error('PrizesReportService.generateReport()', error);
      return {
        success: false,
        message: 'Sorry, we had a trouble generating the report',
      };
    }
  }
}
