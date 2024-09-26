import { AllMiddlewareArgs } from '@slack/bolt';
import { AppDataSource } from '../data-source';
import { Recognition } from '../entity/recognition';
import { getSlackUserInfo } from '../utils/user-slack-info';
import { WalletController } from './wallet';

type RecognitionSummary = {
  userId: string;
  recognitionCount: number;
}[];

export class RecognitionController {
  private readonly recognitionRepository =
    AppDataSource.getRepository(Recognition);

  public async save(
    fromId: string,
    toId: string,
    client: AllMiddlewareArgs['client']
  ) {
    const recognition = new Recognition();
    recognition.fromId = fromId;
    recognition.fromName = await getSlackUserInfo(client, fromId);
    recognition.toName = await getSlackUserInfo(client, toId);
    recognition.toId = toId;
    try {
      const response = await this.recognitionRepository.save(recognition);
      if (response.id) {
        //TODO: definir env para o valor default
        await new WalletController().deposit(toId, 100);
      }
      return { ok: true };
    } catch (error) {
      console.error(error);
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
