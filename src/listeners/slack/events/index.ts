import { App } from '@slack/bolt';
import { appHomeOpenedHandler } from '@/features/home-page/handlers';

const register = (app: App) => {
  app.event('app_home_opened', appHomeOpenedHandler);
};

export default { register };
