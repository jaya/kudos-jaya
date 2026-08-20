import { App } from '@slack/bolt';
import { registerInstallationHandlers } from '@/features/installation/handlers';
import actions from '../actions';
import commands from '../commands';
import events from '../events';
import views from '../views';

const registerListeners = (app: App) => {
  registerInstallationHandlers(app);
  actions.register(app);
  commands.register(app);
  events.register(app);
  views.register(app);
};

export default registerListeners;
