import { App } from '@slack/bolt';
import chooseCardButtonCallback from './choose-card';
import productPagesCallback from './product-pages';

const register = (app: App) => {
  app.action('redeem_button', productPagesCallback);
  app.action('choose_card', chooseCardButtonCallback);
  app.action('products_page_next', productPagesCallback);
  app.action('products_page_previous', productPagesCallback);
};

export default { register };
