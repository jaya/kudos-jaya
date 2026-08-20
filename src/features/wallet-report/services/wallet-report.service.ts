import { WalletController } from '@/controllers';
import { RequestContext } from '@/context';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import logger from '@/utils/logger';
import { WalletReportParams, WalletReportResult } from '../types';

export class WalletReportService {
  async generateReport(
    params: Omit<WalletReportParams, 'teamId'>,
    client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<WalletReportResult> {
    const { userId } = params;
    const { teamId } = RequestContext.get();

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
      const operation = this.identifyFailedOperation(error);
      logger.error(
        `WalletReportService.generateReport() - Failed at: ${operation}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        success: false,
        message: 'Sorry, we had a trouble generating the report',
      };
    }
  }

  private identifyFailedOperation(error: unknown): string {
    if (error instanceof Error && error.stack) {
      if (error.stack.includes('writeCsv')) return 'CSV Writing';
      if (error.stack.includes('uploadFile')) return 'File Upload';
      if (error.stack.includes('fetchWalletReport')) return 'Report Fetching';
    }
    return 'Unknown Operation';
  }
}
