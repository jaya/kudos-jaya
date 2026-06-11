import { App } from '@slack/bolt';
import { giveKudosCommandHandler } from '@/features/kudos/handlers';
import { cancelKudosCommandHandler } from '@/features/cancel-kudos/handlers';

const register = (app: App) => {
  app.command('/give-kudos', giveKudosCommandHandler);
  app.command('/cancel-kudos', cancelKudosCommandHandler);
};

export default { register };
