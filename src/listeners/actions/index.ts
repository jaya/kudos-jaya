import { App } from '@slack/bolt';
import chooseCardButtonCallback from './choose-card';
import productPagesButtonCallback from './product-pages';
import redeemButtonCallback from './redeem';
import sampleActionCallback from './sample-action';

const register = (app: App) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('redeem_button', redeemButtonCallback);
  app.action('choose_card', chooseCardButtonCallback);
  app.action('products_page_next', productPagesButtonCallback);
  app.action('products_page_previous', productPagesButtonCallback);
};

export default { register };
