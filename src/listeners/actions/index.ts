import { App } from '@slack/bolt';
import chooseCardButtonCallback from './choose-card';
import redeemButtonCallback from './redeem';
import sampleActionCallback from './sample-action';

const register = (app: App) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('redeem_button', redeemButtonCallback);
  app.action('choose_card', chooseCardButtonCallback);
};

export default { register };
