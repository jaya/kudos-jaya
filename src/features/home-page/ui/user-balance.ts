import { RecognitionController } from '@/controllers/recognition';
import { WalletController } from '@/controllers/wallet';
import { Divider, TextSection, ButtonSection } from './types';

export async function getUserBalanceSection(params: {
  user: string;
  teamId: string;
}): Promise<(TextSection | ButtonSection | Divider)[]> {
  const { user, teamId } = params;

  const userTotalRecognitions = await new RecognitionController().getTotal({
    userId: user,
    teamId,
  });

  const balance = await new WalletController().getBalance({
    ownerId: user,
    teamId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userBalanceComponent: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:trophy: <@${user}>, your prizes balance :trophy:
      *Recognitions*: ${userTotalRecognitions}
      *Balance*: R$ ${balance}`,
      },
    },
  ];

  const redeemButton = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Redeem',
          emoji: true,
        },
        value: 'open,1',
        action_id: 'redeem_button',
      },
    ],
  };

  const divider: Divider = {
    type: 'divider',
  };

  if (balance > 0) {
    userBalanceComponent.push(redeemButton);
  }

  userBalanceComponent.push(divider);

  return userBalanceComponent;
}
