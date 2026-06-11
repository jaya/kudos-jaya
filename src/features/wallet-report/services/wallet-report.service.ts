import { WalletController } from '@/controllers';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import logger from '@/utils/logger';
import { WalletReportParams, WalletReportResult } from '../types';

export class WalletReportService {
  async generateReport(
    params: WalletReportParams,
    client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<WalletReportResult> {
    const { userId, teamId } = params;

    try {
      const reportData = await new WalletController().fetchWalletReport({
        teamId,
      });

      if (reportData.length === 0) {
        return {
          success: false,
          message:
            'Sorry, we do not have enough data to generate the wallet report yet.',
        };
      }

      await writeCsv(reportData);
      const fileUrl = await uploadFile({ client, channelId: userId });

      return {
        success: true,
        message: 'Here is the report',
        fileUrl,
      };
    } catch (error) {
      logger.error('WalletReportService.generateReport()', error);
      return {
        success: false,
        message: 'Sorry, we had a trouble generating the report',
      };
    }
  }
}
