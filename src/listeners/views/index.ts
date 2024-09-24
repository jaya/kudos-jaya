import { App } from '@slack/bolt';
import giveKudosViewCallback from './give-kudos';
import sampleViewCallback from './sample-view';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);

  app.view('give_kudos_view', giveKudosViewCallback);
};

export default { register };
