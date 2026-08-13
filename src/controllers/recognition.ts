import { AppDataSource } from '@/data-source';
import { Recognition, User } from '@/entities/';
import { InternalError } from '@/errors';
import logger from '@/utils/logger';
import { RequestContext } from '@/context';
import { Between, In } from 'typeorm';
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
  botToken?: string;
};

export class RecognitionController {
  private readonly recognitionRepository =
    AppDataSource.getRepository(Recognition);
  private readonly userController = new UserController();
  private readonly walletController = new WalletController();

  public async save(params: SaveRecognitionParams) {
    const { toId, teamId, fromId } = params;
    const botToken = params.botToken || RequestContext.get().botToken;
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
      logger.error('RecognitionController.save() failed', {
        fromId: params.fromId,
        toId: params.toId,
        teamId: params.teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to save recognition', error);
    }
  }

  public async getMonthlyKudosGivenCount(
    teamId: string,
    fromId: string,
  ): Promise<number> {
    // Get current time in Brazil timezone (UTC-3)
    const now = new Date();
    const brazilTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
    );

    // Calculate month boundaries in Brazil time
    const startOfMonth = new Date(
      brazilTime.getFullYear(),
      brazilTime.getMonth(),
      1,
    );
    const startOfNextMonth = new Date(
      brazilTime.getFullYear(),
      brazilTime.getMonth() + 1,
      1,
    );

    // Convert back to UTC for database query
    const brazilOffsetMs = now.getTime() - brazilTime.getTime();
    const startOfMonthUtc = new Date(startOfMonth.getTime() + brazilOffsetMs);
    const startOfNextMonthUtc = new Date(
      startOfNextMonth.getTime() + brazilOffsetMs,
    );

    return this.recognitionRepository.count({
      where: {
        teamId,
        fromId,
        createdAt: Between(startOfMonthUtc, startOfNextMonthUtc),
      },
    });
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
      .innerJoin(
        User,
        'user',
        'user.id = recognition.toId AND user.teamId = recognition.teamId',
      )
      .where('recognition.teamId = :teamId', { teamId })
      .andWhere('user.isActive = :isActive', { isActive: true })
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

  public async findWithPagination({
    teamId,
    params,
    page = 1,
    pageSize = 20,
  }: {
    teamId: string;
    params: Partial<Recognition>;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Recognition[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;

    const [recognitions, totalCount] =
      await this.recognitionRepository.findAndCount({
        where: {
          teamId,
          ...params,
        },
        skip,
        take: pageSize,
      });

    return {
      data: recognitions,
      currentPage: page,
      pageSize: pageSize,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
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
