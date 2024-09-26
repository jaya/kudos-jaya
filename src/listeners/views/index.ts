import { App } from '@slack/bolt';
import generateGiftCardCallback from './generate-card';
import giveKudosViewCallback from './give-kudos';
import sampleViewCallback from './sample-view';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('give_kudos_view', giveKudosViewCallback);
  app.view('generate_gift_card', generateGiftCardCallback);
};

export default { register };
