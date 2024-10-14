import { App } from '@slack/bolt';
import giveKudosCommandCallback from './give-kudos';

const register = (app: App) => {
  app.command('/give-kudos', giveKudosCommandCallback);
};

export default { register };
