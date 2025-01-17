import { InstallationController } from '@/controllers/installation';
import logger from '@/utils/logger';

const saveSettingsCallback = async ({ ack, view, client, body }) => {
  try {
    await ack();
    const userId = body.user.id;
    const teamId = view.team_id;
    const todoToken = view.state.values['setup_todo_token']['todo_token'].value;
    const defaulChannelId =
      view.state.values['setup_default_channel_id']['default_channel_id'].value;

    const updatedSettings = await new InstallationController().update({
      teamId: teamId,
      giftCardApiToken: todoToken,
      defaultRecognitionChannel: defaulChannelId,
    });

    if (updatedSettings.defaultRecognitionChannel === defaulChannelId) {
      await client.chat.postMessage({
        channel: userId,
        text: "*Awesome!* 🎉 Now that we're ready, type `/give-kudos` in chat and spread the *gratitude* and *love* with your colleagues.",
      });
    }
  } catch (error) {
    logger.error('saveSettingsCallback()', { error });
  }
};

export default saveSettingsCallback;
