import { handleGetAnotherGif } from '@/views/give-kudos';
import { App } from '@slack/bolt';
import appSettingsButtonCallback from './app-settings';
import chooseCardButtonCallback from './choose-card';
import prizesReportModalCallback from './prizes-report-modal';
import productsPageCallback from './product-pages';
import walletReportCallback from './wallet-report';

const register = (app: App) => {
  app.action('redeem_button', productsPageCallback);
  app.action('choose_card', chooseCardButtonCallback);
  app.action('products_page', productsPageCallback);
  app.action('app_settings', appSettingsButtonCallback);
  app.action('open_prizes_report_modal', prizesReportModalCallback);
  app.action('open_wallet_report', walletReportCallback);
  app.action('get_another_gif', handleGetAnotherGif);
};

export default { register };
