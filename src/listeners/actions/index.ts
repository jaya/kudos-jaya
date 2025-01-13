import { App } from '@slack/bolt';
import chooseCardButtonCallback from './choose-card';
import productsPageCallback from './product-pages';
import finishInstallButtonCallback from './finish-install';

const register = (app: App) => {
  app.action('redeem_button', productsPageCallback);
  app.action('choose_card', chooseCardButtonCallback);
  app.action('products_page', productsPageCallback);
  app.action('finish_install', finishInstallButtonCallback);
};

export default { register };
