import { AppDataSource } from '@/data-source';
import { Installation } from '@/entity/installation';
import { encrypt } from '@/utils/encrypt';
import logger from '@/utils/logger';

export class InstallationController {
  private readonly repository = AppDataSource.getRepository(Installation);

  public async find(teamId: string): Promise<Partial<Installation>> {
    return await this.repository.findOneBy({ teamId });
  }

  public async create(installation): Promise<Installation> {
    return await this.repository.save({
      teamId: installation.team.id,
      teamName: installation.team.name,
      defaultAmount: 100,
      ...installation,
    });
  }

  public async update(
    installation: Partial<Installation>
  ): Promise<Partial<Installation>> {
    try {
      const { teamId, giftCardApiToken } = installation;

      if (giftCardApiToken) {
        installation['giftCardApiToken'] = encrypt(giftCardApiToken);
      }

      await this.repository.update(
        { teamId },
        {
          ...installation,
        }
      );

      return await this.find(teamId);
    } catch (error) {
      logger.error('InstallationController.update()', error);
    }
  }
}
