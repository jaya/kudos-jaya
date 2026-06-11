import logger from '@/utils/logger';
import { InstallationService } from '../services/installation.service';

const saveSettingsViewHandler = async ({ ack, view, client, body }) => {
  try {
    await ack();

    const userId = body.user.id;
    const teamId = view.team_id;
    const botToken = client.token;

    const todoToken =
      view.state.values['setup_todo_token']['todo_token']?.value;
    const defaultChannelId =
      view.state.values['setup_default_channel_id']['default_channel_id']
        ?.value;
    const defaultAmount =
      view.state.values['setup_default_amount']['default_amount']?.value;
    const companyValues =
      view.state.values['setup_company_values']['company_values']?.value;
    const monthlyKudosLimitValue =
      view.state.values['setup_monthly_kudos_limit']?.['monthly_kudos_limit']
        ?.value;
    const auditorUsers =
      view.state.values['auditor_users']['auditor_users'].selected_users;

    const service = new InstallationService();

    await service.saveSettings({
      teamId,
      userId,
      botToken,
      todoToken,
      defaultChannelId,
      defaultAmount: defaultAmount ? Number(defaultAmount) : undefined,
      companyValues,
      monthlyKudosLimit:
        // eslint-disable-next-line eqeqeq
        monthlyKudosLimitValue != null ? Number(monthlyKudosLimitValue) : null,
      auditorUserIds: auditorUsers,
    });

    await client.chat.postMessage({
      channel: userId,
      // prettier-ignore
      text: '*Awesome!* 🎉 Now that we\'re ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.',
    });
  } catch (error) {
    logger.error('saveSettingsViewHandler()', error);
  }
};

export default saveSettingsViewHandler;
