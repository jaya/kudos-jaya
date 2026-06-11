import { TransactionController } from '@/controllers/transaction';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import logger from '@/utils/logger';
import { PrizesReportParams, PrizesReportResult } from '../types';

export class PrizesReportService {
  async generateReport(
    params: PrizesReportParams,
    client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<PrizesReportResult> {
    const { userId, teamId, startDate, endDate } = params;

    try {
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
      const fileUrl = await uploadFile({ client, channelId: userId });

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
