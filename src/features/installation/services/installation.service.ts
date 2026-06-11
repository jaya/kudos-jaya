import { InstallationController, UserController } from '@/controllers';
import logger from '@/utils/logger';
import { CurrentSettingsResponse, SaveSettingsParams } from '../types';

export class InstallationService {
  private readonly installationController = new InstallationController();
  private readonly userController = new UserController();

  async getCurrentSettings(teamId: string): Promise<CurrentSettingsResponse> {
    try {
      return await this.installationController.getCurrentSettings(teamId);
    } catch (error) {
      logger.error('InstallationService.getCurrentSettings()', error);
      throw error;
    }
  }

  async getAuditorUsers(
    teamId: string,
  ): Promise<{ id: string; name: string }[]> {
    try {
      const users = await this.userController.findMany({
        teamId,
        params: { isAuditor: true },
      });
      return users.map((user) => ({
        id: user.id as string,
        name: user.name as string,
      }));
    } catch (error) {
      logger.error('InstallationService.getAuditorUsers()', error);
      throw error;
    }
  }

  async saveSettings(params: SaveSettingsParams): Promise<void> {
    try {
      const {
        teamId,
        botToken,
        todoToken,
        defaultChannelId,
        defaultAmount,
        companyValues,
        monthlyKudosLimit,
        auditorUserIds,
      } = params;

      const updateObject: Record<string, unknown> = { teamId };

      if (todoToken) {
        updateObject['giftCardApiToken'] = todoToken;
      }

      if (defaultChannelId) {
        updateObject['defaultRecognitionChannel'] = defaultChannelId;
      }

      if (defaultAmount) {
        updateObject['defaultAmount'] = defaultAmount;
      }

      if (companyValues) {
        updateObject['companyValues'] = companyValues;
      }

      updateObject['monthlyKudosLimit'] = monthlyKudosLimit ?? null;

      await this.installationController.update(updateObject);

      if (auditorUserIds && auditorUserIds.length > 0) {
        await this.userController.setAuditors({
          botToken,
          teamId,
          userIds: auditorUserIds,
        });
      }
    } catch (error) {
      logger.error('InstallationService.saveSettings()', error);
      throw error;
    }
  }
}
