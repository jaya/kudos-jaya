import { InstallationController, UserController } from '@/controllers';
import logger from '@/utils/logger';

const saveSettingsCallback = async ({ ack, view, client, body }) => {
  try {
    await ack();
    const userId = body.user.id;
    const teamId = view.team_id;
    const botToken = client.token;

    const todoToken =
      view.state.values['setup_todo_token']['todo_token']?.value;
    const defaulChannelId =
      view.state.values['setup_default_channel_id']['default_channel_id']
        ?.value;
    const defaultAmount =
      view.state.values['setup_default_amount']['default_amount']?.value;
    const companyValues =
      view.state.values['setup_company_values']['company_values']?.value;

    const auditorUsers =
      view.state.values['auditor_users']['auditor_users'].selected_users;

    const updateObject = { teamId };

    if (todoToken) {
      updateObject['giftCardApiToken'] = todoToken;
    }

    if (defaulChannelId) {
      updateObject['defaultRecognitionChannel'] = defaulChannelId;
    }

    if (defaultAmount) {
      updateObject['defaultAmount'] = Number(defaultAmount);
    }

    if (companyValues) {
      updateObject['companyValues'] = companyValues;
    }

    const updatedSettings = await new InstallationController().update(
      updateObject,
    );

    if (auditorUsers?.length > 0) {
      await new UserController().setAuditors({
        botToken,
        teamId,
        userIds: auditorUsers,
      });
    }

    if (updatedSettings.defaultRecognitionChannel === defaulChannelId) {
      await client.chat.postMessage({
        channel: userId,
        // eslint-disable-next-line quotes
        text: "*Awesome!* 🎉 Now that we're ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.",
      });
    }
  } catch (error) {
    logger.error('saveSettingsCallback()', { error });
  }
};

export default saveSettingsCallback;
