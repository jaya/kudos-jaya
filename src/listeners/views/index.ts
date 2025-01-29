import { App } from '@slack/bolt';
import generateGiftCardCallback from './generate-card';
import generatePrizesReportCallback from './generate-prizes-report';
import giveKudosViewCallback from './give-kudos';
import saveSettingsCallback from './save-settings';

const register = (app: App) => {
  app.view('give_kudos_view', giveKudosViewCallback);
  app.view('generate_gift_card', generateGiftCardCallback);
  app.view('settings_view', saveSettingsCallback);
  app.view('generate_prizes_report', generatePrizesReportCallback);
};

export default { register };
