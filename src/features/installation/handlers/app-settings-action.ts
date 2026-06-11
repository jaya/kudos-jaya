import logger from '@/utils/logger';
import { buildSettingsModal } from '../ui/settings-modal';
import { InstallationService } from '../services/installation.service';

const appSettingsActionHandler = async ({ ack, client, body }) => {
  try {
    await ack();

    const teamId = body.user.team_id;
    const service = new InstallationService();

    const settings = await service.getCurrentSettings(teamId);
    const auditorUsers = await service.getAuditorUsers(teamId);
    const auditorUserIds = auditorUsers.map(({ id }) => id);

    const modal = buildSettingsModal(settings, auditorUserIds);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    logger.error('appSettingsActionHandler()', error);
  }
};

export default appSettingsActionHandler;
