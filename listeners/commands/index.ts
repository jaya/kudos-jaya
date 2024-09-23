import { App } from '@slack/bolt';
import giveKudosCommandCallback from './give-kudos';
import sampleCommandCallback from './sample-command';

const register = (app: App) => {
  app.command('/sample-command', sampleCommandCallback);
  app.command('/give-kudos', giveKudosCommandCallback);
};

export default { register };
