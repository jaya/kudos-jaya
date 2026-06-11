import { RecognitionController } from '@/controllers';
import { Recognition } from '@/entities';
import logger from '@/utils/logger';
import { Not, IsNull } from 'typeorm';

export class CancelKudosService {
  private recognitionController: RecognitionController;

  constructor() {
    this.recognitionController = new RecognitionController();
  }

  public async getUserKudos(
    teamId: string,
    userId: string,
  ): Promise<Recognition[]> {
    try {
      return await this.recognitionController.find({
        teamId,
        params: {
          fromId: userId,
          slackMessageId: Not(IsNull()) as unknown as string,
        },
      });
    } catch (error) {
      logger.error('getUserKudos()', error);
      return [];
    }
  }

  public async deleteKudos(
    teamId: string,
    slackMessageId: string,
    slackChannelId: string,
  ): Promise<boolean> {
    try {
      await this.recognitionController.delete({
        teamId,
        params: { slackChannelId, slackMessageId },
      });
      return true;
    } catch (error) {
      logger.error('deleteKudos()', error);
      return false;
    }
  }
}
