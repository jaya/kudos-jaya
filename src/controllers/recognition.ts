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
    const now = new Date();

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const dateParts = dateFormatter.formatToParts(now);

    const yearPart = dateParts.find((p) => p.type === 'year');
    const monthPart = dateParts.find((p) => p.type === 'month');
    const dayPart = dateParts.find((p) => p.type === 'day');
    const hourPart = timeParts.find((p) => p.type === 'hour');
    const minutePart = timeParts.find((p) => p.type === 'minute');
    const secondPart = timeParts.find((p) => p.type === 'second');

    if (
      !yearPart ||
      !monthPart ||
      !dayPart ||
      !hourPart ||
      !minutePart ||
      !secondPart
    ) {
      logger.error('Failed to parse date components from Brazil timezone', {
        teamId,
        fromId,
        dateParts: dateParts.map((p) => `${p.type}:${p.value}`),
        timeParts: timeParts.map((p) => `${p.type}:${p.value}`),
      });
      throw new Error('Failed to parse Brazil timezone date components');
    }

    const year = parseInt(yearPart.value);
    const month = parseInt(monthPart.value) - 1;
    const day = parseInt(dayPart.value);
    const hour = parseInt(hourPart.value);
    const minute = parseInt(minutePart.value);
    const second = parseInt(secondPart.value);

    // Create a reference point: current time in Brazil timezone
    const brazilCurrentTimeLocal = new Date(
      Date.UTC(year, month, day, hour, minute, second),
    );

    // Calculate offset by comparing Brazil time (as if local) with actual UTC now
    // The difference tells us how to convert between UTC and Brazil timezone
    const offsetMs = now.getTime() - brazilCurrentTimeLocal.getTime();

    // Create month boundaries in Brazil timezone and convert to UTC
    const startOfMonthBrazil = new Date(Date.UTC(year, month, 1));
    const startOfNextMonthBrazil = new Date(Date.UTC(year, month + 1, 1));

    const startOfMonthUtc = new Date(startOfMonthBrazil.getTime() - offsetMs);
    const startOfNextMonthUtc = new Date(
      startOfNextMonthBrazil.getTime() - offsetMs,
    );

    logger.debug('getMonthlyKudosGivenCount timezone conversion', {
      teamId,
      fromId,
      nowUtc: now.toISOString(),
      brazilTime: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      offsetMs,
      startOfMonthUtc: startOfMonthUtc.toISOString(),
      startOfNextMonthUtc: startOfNextMonthUtc.toISOString(),
    });

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
