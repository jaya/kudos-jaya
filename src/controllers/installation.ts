import { AppDataSource } from '@/data-source';
import { Installation } from '@/entities/';
import { InternalError } from '@/errors';
import { decrypt, encrypt } from '@/utils/encrypt';
import logger from '@/utils/logger';

export class InstallationController {
  private readonly repository = AppDataSource.getRepository(Installation);

  public async find(teamId: string): Promise<Partial<Installation>> {
    return this.repository.findOneBy({ teamId });
  }

  public async findMany({
    params,
  }: {
    params: Partial<Installation>;
  }): Promise<Partial<Installation>[]> {
    return this.repository.find({ where: { ...params } });
  }

  public async create(installation): Promise<Installation> {
    return this.repository.save({
      teamId: installation.team.id,
      teamName: installation.team.name,
      defaultAmount: 100,
      ...installation,
    });
  }

  public async update(
    installation: Partial<Installation>,
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
        },
      );

      return await this.find(teamId);
    } catch (error) {
      logger.error('InstallationController.update() failed', {
        teamId: installation.teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Failed to update installation', error);
    }
  }

  public async getCurrentSettings(teamId: string) {
    const installation = await this.repository.findOneBy({ teamId });
    const giftCardApiTokenHint = 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const defaultAmountHint = 'Ex: 100.';
    const defaultChannelHint =
      'Enter the default Slack channel id (ex: C93LZNJ64, #bots).';
    const companyValuesHint = 'Separate by comma';
    const monthlyKudosLimitHint =
      'Leave empty for unlimited. Ex: 5 (users can give at most 5 kudos per month).';
    if (
      !installation?.giftCardApiToken ||
      !installation?.defaultRecognitionChannel
    ) {
      return {
        giftCardApiTokenHint,
        defaultAmountHint,
        defaultChannelHint,
        alreadyInstalled: false,
        companyValuesHint,
        monthlyKudosLimitHint,
      };
    }

    return {
      giftCardApiTokenHint: `${giftCardApiTokenHint}\nCurrent: ${decrypt(installation.giftCardApiToken).substring(0, 15)}...`,
      defaultAmountHint: `${defaultAmountHint}\nCurrent: ${installation.defaultAmount}`,
      defaultChannelHint: `${defaultChannelHint}\nCurrent: ${installation.defaultRecognitionChannel}`,
      alreadyInstalled: true,
      companyValuesHint: `${companyValuesHint}\nCurrent: ${installation.companyValues ?? ''}`,
      monthlyKudosLimitHint: installation.monthlyKudosLimit
        ? `${monthlyKudosLimitHint}\nCurrent: ${installation.monthlyKudosLimit}`
        : `${monthlyKudosLimitHint}\nCurrent: unlimited`,
    };
  }
}
