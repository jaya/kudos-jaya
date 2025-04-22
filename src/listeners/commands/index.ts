import { App } from '@slack/bolt';
import cancelKudosCommandCallback from './cancel-kudos';
import giveKudosCommandCallback from './give-kudos';

const register = (app: App) => {
  app.command('/give-kudos', giveKudosCommandCallback);
  app.command('/cancel-kudos', cancelKudosCommandCallback);
};

export default { register };
