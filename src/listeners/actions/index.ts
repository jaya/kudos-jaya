import { App } from '@slack/bolt';
import {
  redeemButtonActionHandler,
  paginationActionHandler,
  chooseCardActionHandler,
} from '@/features/card-redemption/handlers';
import { openPrizesReportHandler } from '@/features/prizes-report';
import { openWalletReportHandler } from '@/features/wallet-report';
import { getGifActionHandler } from '@/features/kudos/handlers';

const register = (app: App) => {
  app.action('redeem_button', redeemButtonActionHandler);
  app.action('choose_card', chooseCardActionHandler);
  app.action('products_page', paginationActionHandler);
  app.action('open_prizes_report_modal', openPrizesReportHandler);
  app.action('open_wallet_report', openWalletReportHandler);
  app.action('get_another_gif', getGifActionHandler);
};

export default { register };
