import { AppDataSource } from '@/data-source';
import { User } from '@/entities/user';
import logger from '@/utils/logger';
import { getSlackUserInfo } from '@/utils/user-slack-info';

export default class UserController {
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
      logger.error('UserController.create()', error);
    }
  }

  public async find(userId: string): Promise<Partial<User>> {
    return this.repository.findOneBy({ id: userId });
  }
}
