import { TransactionController } from '@/controllers/transaction';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import logger from '@/utils/logger';
import { RequestContext } from '@/context';
import { PrizesReportResult } from '../types';

export class PrizesReportService {
  async generateReport(
    userId: string,
    startDate: string,
    endDate: string,
    client: any,
  ): Promise<PrizesReportResult> {
    const { teamId } = RequestContext.get();

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
