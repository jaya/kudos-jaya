import { AppDataSource } from '@/data-source';
import { Installation } from '@/entity/installation';
import { encrypt } from '@/utils/encrypt';

export class InstallationController {
  private readonly repository = AppDataSource.getRepository(Installation);

  public async find(teamId: string): Promise<Installation> {
    return await this.repository.findOneBy({ teamId });
  }

  public async create(installation): Promise<Installation> {
    return await this.repository.save({
      teamId: installation.team.id,
      teamName: installation.team.name,
      ...installation,
    });
  }

  public async update(
    installation: Partial<Installation>
  ): Promise<Installation> {
    const { teamId, giftCardApiToken, defaultRecognitionChannel } =
      installation;

    await this.repository.update(
      { teamId },
      { giftCardApiToken: encrypt(giftCardApiToken), defaultRecognitionChannel }
    );

    return await this.find(teamId);
  }
}
