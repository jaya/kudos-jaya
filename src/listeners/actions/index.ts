import { App } from '@slack/bolt';
import sampleActionCallback from './sample-action';
import redeemButtonCallback from './redeem';

const register = (app: App) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('redeem_button', redeemButtonCallback);
};

export default { register };
