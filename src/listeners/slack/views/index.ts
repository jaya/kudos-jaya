import { App } from '@slack/bolt';
import { giveKudosViewHandler } from '@/features/kudos/handlers';
import { generateCardViewHandler } from '@/features/card-redemption/handlers';
import { generatePrizesReportViewHandler } from '@/features/prizes-report';
import { generateWalletReportViewHandler } from '@/features/wallet-report/handlers';
import { cancelKudosViewHandler } from '@/features/cancel-kudos/handlers';

const register = (app: App) => {
  app.view('give_kudos_view', giveKudosViewHandler);
  app.view('generate_gift_card', generateCardViewHandler);
  app.view('generate_prizes_report', generatePrizesReportViewHandler);
  app.view('cancel_selected_kudos', cancelKudosViewHandler);
  app.view('generate_wallet_report', generateWalletReportViewHandler);
};

export default { register };
