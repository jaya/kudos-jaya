import { App } from '@slack/bolt';
import cancelKudosCallback from './cancel-kudos';
import generateGiftCardCallback from './generate-card';
import generatePrizesReportCallback from './generate-prizes-report';
import giveKudosViewCallback from './give-kudos';

const register = (app: App) => {
  app.view('give_kudos_view', giveKudosViewCallback);
  app.view('generate_gift_card', generateGiftCardCallback);
  app.view('generate_prizes_report', generatePrizesReportCallback);
  app.view('cancel_selected_kudos', cancelKudosCallback);
};

export default { register };
