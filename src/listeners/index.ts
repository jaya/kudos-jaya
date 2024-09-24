import { App } from '@slack/bolt';
import actions from './actions';
import commands from './commands';
import views from './views';

const registerListeners = (app: App) => {
  actions.register(app);
  commands.register(app);
  //events.register(app);
  //messages.register(app);
  //shortcuts.register(app);
  views.register(app);
};

export default registerListeners;
