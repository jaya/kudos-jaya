import { AppDataSource } from '@/data-source';
import { Installation } from '@/entity/installation';

export class InstallationController {
  private readonly installationRepository =
    AppDataSource.getRepository(Installation);

  public async find(teamId: string): Promise<Installation> {
    return await this.installationRepository.findOneBy({ teamId });
  }

  public async create(installation): Promise<Installation> {
    return await this.installationRepository.save({
      teamId: installation.team.id,
      teamName: installation.team.name,
      ...installation,
    });
  }

  // public async update(installation): Promise<Installation> {

  // }
}
