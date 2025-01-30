import { TransactionController } from '@/controllers/transaction';
import { WalletController } from '@/controllers/wallet';
import { isUserAdmin } from '@/utils/user-slack-info';

export async function getAdminPanelSection(params: {
  token: string;
  user: string;
  teamId: string;
}) {
  const { token, user, teamId } = params;

  const isAdmin = await isUserAdmin(token, user);

  if (!isAdmin) return [];

  const balanceToBeRedeemed =
    await new WalletController().getBalanceToBeRedeemed({ teamId });
  const transactionController = new TransactionController();
  const redeemedThisMonth = await transactionController.redeemed({
    teamId,
    start: new Date(new Date().setDate(1)),
    end: new Date(),
  });
  const totalRedeemed = await transactionController.redeemed({
    teamId,
  });

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*My team: (for admins only)*
Balance to be redeemed: R$ ${balanceToBeRedeemed}
Balance redeemed this month: R$ ${redeemedThisMonth}
Total redeemed: R$ ${totalRedeemed}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Settings',
            emoji: true,
          },
          value: 'origin=home',
          action_id: 'app_settings',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Prizes report',
            emoji: true,
          },
          action_id: 'open_prizes_report_modal',
        },
      ],
    },
    {
      type: 'divider',
    },
  ];
}
