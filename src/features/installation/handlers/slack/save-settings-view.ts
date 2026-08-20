import logger from '@/utils/logger';
import { InstallationService } from '../../services/installation.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const saveSettingsViewHandler = withRequestContext(
  async ({ ack, view, body }) => {
    try {
      await ack();

      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const userId = body.user.id;

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
        userId,
        todoToken,
        defaultChannelId,
        defaultAmount: defaultAmount ? Number(defaultAmount) : undefined,
        companyValues,
        monthlyKudosLimit:
          // eslint-disable-next-line eqeqeq
          monthlyKudosLimitValue != null
            ? Number(monthlyKudosLimitValue)
            : null,
        auditorUserIds: auditorUsers,
      });

      await adapter.postMessage({
        channel: userId,
        // eslint-disable-next-line quotes
        text: "*Awesome!* 🎉 Now that we're ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.",
      });
    } catch (error) {
      logger.error('saveSettingsViewHandler()', error);
    }
  },
);

export default saveSettingsViewHandler;
