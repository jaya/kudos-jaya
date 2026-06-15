import { AppDataSource } from '@/data-source';
import { User } from '@/entities/user';
import { InternalError } from '@/errors';
import logger from '@/utils/logger';
import {
  getSlackUserInfo,
  getSlackUserActiveStatus,
} from '@/utils/user-slack-info';
import { In, Not } from 'typeorm';

export class UserController {
  private readonly repository = AppDataSource.getRepository(User);

  public async create(params: {
    botToken: string;
    teamId: string;
    userId: string;
  }): Promise<Partial<User>> {
    try {
      const { botToken, userId, teamId } = params;
      const user = await getSlackUserInfo(botToken, userId);
      return await this.repository.save({ id: userId, teamId, ...user });
    } catch (error) {
      logger.error('UserController.create() failed', {
        userId: params.userId,
        teamId: params.teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to create user', error);
    }
  }

  public async find({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  }): Promise<Partial<User>> {
    return this.repository.findOneBy({ id: userId, teamId });
  }

  public async setAuditors(params: {
    botToken: string;
    teamId: string;
    userIds: string[];
  }): Promise<void> {
    //TODO: Verificar se a wallet existe e se não existe, criar
    try {
      const { botToken, teamId, userIds } = params;

      await this.repository.update(
        { teamId, id: Not(In(userIds)) },
        { isAuditor: false },
      );

      const users = await Promise.all(
        userIds.map((userId) => getSlackUserInfo(botToken, userId)),
      );

      const updatedUsers = users.map((user, index) => ({
        id: userIds[index],
        teamId,
        ...user,
        isAuditor: true,
      }));

      await this.repository.save(updatedUsers);
    } catch (error) {
      logger.error('UserController.setAuditors() failed', {
        teamId: params.teamId,
        auditorCount: params.userIds.length,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to set auditors', error);
    }
  }

  public async findMany({
    teamId,
    params = {},
  }: {
    teamId: string;
    params?: Partial<User>;
  }): Promise<Partial<User>[]> {
    return this.repository.find({ where: { teamId, ...params } });
  }

  public async updateEmailIfNull({
    botToken,
    teamId,
    userId,
  }: {
    botToken: string;
    teamId: string;
    userId: string;
  }): Promise<void> {
    try {
      const user = await this.repository.findOneBy({ id: userId, teamId });

      if (!user || user.email) {
        return;
      }

      const { email } = await getSlackUserInfo(botToken, userId);

      if (email) {
        await this.repository.update({ id: userId }, { email });
      }
    } catch (error) {
      logger.error('UserController.updateEmailIfNull() failed', {
        userId,
        teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to update user email', error);
    }
  }

  public async syncActiveStatus(params: {
    botToken: string;
    teamId: string;
  }): Promise<void> {
    try {
      const { botToken, teamId } = params;
      const users = await this.repository.find({ where: { teamId } });

      await Promise.all(
        users.map(async (user) => {
          const isActive = await getSlackUserActiveStatus(botToken, user.id);
          if (user.isActive !== isActive) {
            await this.repository.update({ id: user.id, teamId }, { isActive });
          }
        }),
      );
    } catch (error) {
      logger.error('UserController.syncActiveStatus() failed', {
        teamId: params.teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to sync active status', error);
    }
  }
}
