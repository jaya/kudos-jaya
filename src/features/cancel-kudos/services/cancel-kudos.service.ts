import { RecognitionController } from '@/controllers';
import { Recognition } from '@/entities';
import logger from '@/utils/logger';
import { RequestContext } from '@/context';
import { Not, IsNull } from 'typeorm';

export class CancelKudosService {
  private recognitionController: RecognitionController;

  constructor() {
    this.recognitionController = new RecognitionController();
  }

  public async getUserKudos(userId: string): Promise<Recognition[]> {
    try {
      const { teamId } = RequestContext.get();
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
    slackMessageId: string,
    slackChannelId: string,
  ): Promise<boolean> {
    try {
      const { teamId } = RequestContext.get();
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
