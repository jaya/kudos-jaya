import { AppDataSource } from '@/data-source';
import { Recognition } from '@/entity/recognition';
import logger from '@/utils/logger';
import { getSlackUserInfo } from '@/utils/user-slack-info';
import config from 'config';
import { WalletController } from './wallet';

type RecognitionSummary = {
  userId: string;
  recognitionCount: number;
}[];

export class RecognitionController {
  private readonly recognitionRepository =
    AppDataSource.getRepository(Recognition);

  public async save(fromId: string, toId: string, message: string) {
    const recognition = new Recognition();
    recognition.fromId = fromId;
    recognition.fromName = await getSlackUserInfo(fromId);
    recognition.toName = await getSlackUserInfo(toId);
    recognition.toId = toId;
    recognition.description = message;
    try {
      const response = await this.recognitionRepository.save(recognition);
      if (response.id) {
        await new WalletController().deposit(
          toId,
          config.get<number>('app.deposit.defaultAmount')
        );
      }
      return { ok: true };
    } catch (error) {
      logger.error('RecognitionController.save()', { error });
      return { ok: false };
    }
  }

  public async getTotal(userId?: string): Promise<number> {
    const total = await this.recognitionRepository.count({
      where: {
        toId: userId,
      },
    });
    return total ?? 0;
  }

  public async getUsersRecognitionSummary(): Promise<RecognitionSummary> {
    const summary = this.recognitionRepository
      .createQueryBuilder('recognition')
      .select('recognition.toId', 'userId')
      .addSelect('COUNT(recognition.id)', 'recognitionCount')
      .groupBy('recognition.toId')
      .orderBy('COUNT(recognition.id)', 'DESC')
      .limit(20)
      .getRawMany();
    return summary;
  }
}
