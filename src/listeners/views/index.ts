import { App } from '@slack/bolt';
import generateGiftCardCallback from './generate-card';
import giveKudosViewCallback from './give-kudos';

const register = (app: App) => {
  app.view('give_kudos_view', giveKudosViewCallback);
  app.view('generate_gift_card', generateGiftCardCallback);
};

export default { register };
