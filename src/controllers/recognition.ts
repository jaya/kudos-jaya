import { AppDataSource } from '@/data-source';
import { Recognition } from '@/entity/recognition';
import logger from '@/utils/logger';
import { InstallationController } from './installation';
import { WalletController } from './wallet';

type RecognitionSummary = {
  userId: string;
  recognitionCount: number;
}[];

type SaveRecognitionParams = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  message: string;
  teamId: string;
};

export class RecognitionController {
  private readonly recognitionRepository =
    AppDataSource.getRepository(Recognition);

  public async save(params: SaveRecognitionParams) {
    const { toId, teamId } = params;
    try {
      const response = await this.recognitionRepository.save(params);
      const { defaultAmount } = await new InstallationController().find(teamId);
      if (response.id) {
        await new WalletController().deposit({
          ownerId: toId,
          amount: defaultAmount,
          teamId,
        });
      }
      return { ok: true };
    } catch (error) {
      logger.error('RecognitionController.save()', { error });
      return { ok: false };
    }
  }

  public async getTotal(params: {
    teamId: string;
    userId?: string;
  }): Promise<number> {
    const total = await this.recognitionRepository.count({
      where: {
        toId: params.userId,
        teamId: params.teamId,
      },
    });
    return total ?? 0;
  }

  public async getUsersRecognitionSummary(
    teamId: string
  ): Promise<RecognitionSummary> {
    const summary = this.recognitionRepository
      .createQueryBuilder('recognition')
      .select('recognition.toId', 'userId')
      .where('recognition.teamId = :teamId', { teamId })
      .addSelect('COUNT(recognition.id)', 'recognitionCount')
      .groupBy('recognition.toId')
      .orderBy('COUNT(recognition.id)', 'DESC')
      .limit(20)
      .getRawMany();
    return summary;
  }
}
