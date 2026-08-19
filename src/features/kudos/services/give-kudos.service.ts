import { InstallationController, RecognitionController } from '@/controllers';
import { Giphy } from '@/clients/giphy/giphy';
import logger from '@/utils/logger';
import { RequestContext } from '@/context';

export interface GiveKudosParams {
  fromId: string;
  toIds: string[];
  message: string;
  companyValues?: string;
  gif: string;
}

export interface ValidationResult {
  canGive: boolean;
  remaining?: number;
  message?: string;
}

export class GiveKudosService {
  private installationController: InstallationController;
  private recognitionController: RecognitionController;
  private giphy: Giphy;

  constructor() {
    this.installationController = new InstallationController();
    this.recognitionController = new RecognitionController();
    this.giphy = new Giphy();
  }

  public async validateMonthlyLimit(fromId: string): Promise<ValidationResult> {
    try {
      const { teamId } = RequestContext.get();
      const installation = await this.installationController.find(teamId);

      if (!installation) {
        return { canGive: true };
      }

      const { monthlyKudosLimit } = installation;

      if (monthlyKudosLimit === null || monthlyKudosLimit === undefined) {
        return { canGive: true };
      }

      const givenThisMonth =
        await this.recognitionController.getMonthlyKudosGivenCount(
          teamId,
          fromId,
        );
      const remaining = monthlyKudosLimit - givenThisMonth;

      if (remaining <= 0) {
        return {
          canGive: false,
          remaining: 0,
          message: `You have reached your monthly kudos limit of ${monthlyKudosLimit}. You can give more kudos next month! :pray:`,
        };
      }

      return {
        canGive: true,
        remaining,
      };
    } catch (error) {
      const errorName =
        error instanceof Error ? error.constructor.name : 'UnknownError';
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('validateMonthlyLimit() failed', {
        fromId,
        errorName,
        errorMessage,
        stack: errorStack,
      });

      if (error instanceof Error && error.message.includes('timezone')) {
        return {
          canGive: false,
          message: 'Kudos system is temporarily unavailable. Please try again.',
        };
      }

      return { canGive: false, message: 'Failed to validate kudos limit' };
    }
  }

  public async createRecognitions(
    params: Omit<GiveKudosParams, 'gif'>,
  ): Promise<Array<{ id: string; success: boolean; toId: string }>> {
    const { teamId } = RequestContext.get();
    const results = [];

    for (const toId of params.toIds) {
      try {
        const response = await this.recognitionController.save({
          fromId: params.fromId,
          toId,
          message: params.message,
          teamId,
        });

        results.push({
          id: response.id,
          success: response.ok,
          toId,
        });
      } catch (error) {
        logger.error('createRecognitions()', error);
        results.push({
          id: '',
          success: false,
          toId,
        });
      }
    }

    return results;
  }

  public async fetchGif(): Promise<string> {
    try {
      return await this.giphy.fetchGif();
    } catch (error) {
      logger.error('fetchGif()', error);
      throw error;
    }
  }

  public async getCompanyValues(): Promise<string | undefined> {
    try {
      const { teamId } = RequestContext.get();
      const { companyValues } = await this.installationController.find(teamId);
      return companyValues;
    } catch (error) {
      logger.error('getCompanyValues()', error);
      return undefined;
    }
  }

  public async getDefaultRecognitionChannel(): Promise<string | undefined> {
    try {
      const { teamId } = RequestContext.get();
      const { defaultRecognitionChannel } =
        await this.installationController.find(teamId);
      return defaultRecognitionChannel;
    } catch (error) {
      logger.error('getDefaultRecognitionChannel()', error);
      return undefined;
    }
  }
}
