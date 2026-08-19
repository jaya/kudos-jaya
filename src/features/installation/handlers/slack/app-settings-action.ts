import logger from '@/utils/logger';
import { buildSettingsModal } from '../../ui/slack/settings-modal';
import { InstallationService } from '../../services/installation.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const appSettingsActionHandler = withRequestContext(async ({ ack, body }) => {
  try {
    await ack();

    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const teamId = body.user.team_id;
    const service = new InstallationService();

    const settings = await service.getCurrentSettings(teamId);
    const auditorUsers = await service.getAuditorUsers(teamId);
    const auditorUserIds = auditorUsers.map(({ id }) => id);

    const modal = buildSettingsModal(settings, auditorUserIds);

    await adapter.openModal({
      triggerId: body.trigger_id,
      view: modal,
    });
  } catch (error) {
    logger.error('appSettingsActionHandler()', error);
  }
});

export default appSettingsActionHandler;
