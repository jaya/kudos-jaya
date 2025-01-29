import { AppDataSource } from '@/data-source';
import { Recognition } from '@/entities/';
import logger from '@/utils/logger';
import { InstallationController } from './installation';
import UserController from './user';
import { WalletController } from './wallet';

export type RecognitionSummary = {
  userId: string;
  recognitionCount: number;
}[];

type SaveRecognitionParams = {
  fromId: string;
  toId: string;
  message: string;
  teamId: string;
  botToken: string;
};

export class RecognitionController {
  private readonly recognitionRepository =
    AppDataSource.getRepository(Recognition);
  private readonly userController = new UserController();

  public async save(params: SaveRecognitionParams) {
    const { toId, teamId, fromId, botToken } = params;
    try {
      let fromUser = await this.userController.find(fromId);
      let toUser = await this.userController.find(toId);
      if (!fromUser) {
        fromUser = await this.userController.create({
          teamId,
          botToken,
          userId: fromId,
        });
      }
      if (!toUser) {
        toUser = await this.userController.create({
          teamId,
          botToken,
          userId: toId,
        });
      }

      const response = await this.recognitionRepository.save({
        fromId,
        fromName: fromUser.name,
        toId,
        toName: toUser.name,
        description: params.message,
        teamId,
      });

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
