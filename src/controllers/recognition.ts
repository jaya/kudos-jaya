import { AppDataSource } from '@/data-source';
import { Recognition } from '@/entities/';
import logger from '@/utils/logger';
import { In } from 'typeorm';
import { InstallationController, UserController, WalletController } from './';

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
  private readonly walletController = new WalletController();

  public async save(params: SaveRecognitionParams) {
    const { toId, teamId, fromId, botToken } = params;
    try {
      let fromUser = await this.userController.find({ userId: fromId, teamId });
      let toUser = await this.userController.find({ userId: toId, teamId });
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

      const { id } = await this.recognitionRepository.save({
        fromId,
        fromName: fromUser.name,
        toId,
        toName: toUser.name,
        description: params.message,
        teamId,
      });

      const { defaultAmount } = await new InstallationController().find(teamId);
      if (id) {
        await this.walletController.deposit({
          ownerId: toId,
          amount: defaultAmount,
          teamId,
        });
      }
      return { ok: true, id };
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
    teamId: string,
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

  public async update({
    teamId,
    id,
    params,
  }: {
    teamId: string;
    id: number[];
    params: Partial<Recognition>;
  }): Promise<void> {
    await this.recognitionRepository.update({ teamId, id: In(id) }, params);
  }

  public async find({
    teamId,
    params,
  }: {
    teamId: string;
    params: Partial<Recognition>;
  }): Promise<Recognition[]> {
    return this.recognitionRepository.find({
      where: {
        teamId,
        ...params,
      },
    });
  }

  public async delete({
    teamId,
    params,
  }: {
    teamId: string;
    params: Partial<Recognition>;
  }) {
    try {
      const wallets = await this.recognitionRepository.find({
        where: {
          teamId,
          ...params,
        },
      });

      const { defaultAmount } = await new InstallationController().find(teamId);

      await Promise.all(
        wallets.map((wallet) =>
          this.walletController.withdraw({
            teamId,
            ownerId: wallet.toId,
            amount: defaultAmount,
          }),
        ),
      );

      await this.recognitionRepository.delete({
        teamId,
        ...params,
      });
    } catch (error) {
      logger.error('RecognitionController.delete()', { error });
    }
  }
}
