import { App } from '@slack/bolt';
import generateGiftCardCallback from './generate-card';
import giveKudosViewCallback from './give-kudos';
import saveSettingsCallback from './save-settings';

const register = (app: App) => {
  app.view('give_kudos_view', giveKudosViewCallback);
  app.view('generate_gift_card', generateGiftCardCallback);
  app.view('settings_view', saveSettingsCallback);
};

export default { register };
