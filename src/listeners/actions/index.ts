import { App } from '@slack/bolt';
import appSettingsButtonCallback from './app-settings';
import chooseCardButtonCallback from './choose-card';
import productsPageCallback from './product-pages';

const register = (app: App) => {
  app.action('redeem_button', productsPageCallback);
  app.action('choose_card', chooseCardButtonCallback);
  app.action('products_page', productsPageCallback);
  app.action('app_settings', appSettingsButtonCallback);
};

export default { register };
