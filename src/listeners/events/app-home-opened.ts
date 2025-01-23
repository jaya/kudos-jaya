import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import { WalletController } from '@/controllers/wallet';
import { decrypt } from '@/utils/encrypt';
import logger from '@/utils/logger';
import { isUserAdmin } from '@/utils/user-slack-info';

type TextSection = {
  type: string;
  text: {
    type: string;
    text: string;
  };
};

type ButtonSection = {
  type: string;
  elements: {
    type: string;
    text: {
      type: string;
      text: string;
      emoji: boolean;
    };
    value: string;
    action_id: string;
  }[];
};

const appHomeOpenedCallback = async ({ client, event }) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') return;
  const teamId = event?.view?.app_installed_team_id;

  const { giftCardApiToken } = await new InstallationController().find(teamId);

  await new TodoCartoes(undefined, decrypt(giftCardApiToken)).fetchProducts();

  const recsController = new RecognitionController();

  const recognitions = await recsController.getTotal({
    userId: event.user,
    teamId,
  });
  const totalRecognitions = await recsController.getTotal({ teamId });
  const balance = await new WalletController().getBalance({
    ownerId: event.user,
    teamId,
  });
  const recognitionSummary = await recsController.getUsersRecognitionSummary(
    teamId
  );
  const { defaultRecognitionChannel } = await new InstallationController().find(
    teamId
  );

  const isAdmin = await isUserAdmin(client.token, event.user);

  const blocks = [];

  const userBalance: (TextSection | ButtonSection)[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:trophy: <@${event.user}>, your prizes balance :trophy: 
      *Recognitions*: ${recognitions}
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

  if (balance > 0) {
    userBalance.push(redeemButton);
  }

  const settingsButton = {
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
    ],
  };

  const divider = {
    type: 'divider',
  };

  const recognitionsListHeader = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:sports_medal: <#${defaultRecognitionChannel}> ${totalRecognitions} recognitions :sports_medal:`,
    },
  };

  const recognitionsList = [];
  for (const recognition of recognitionSummary) {
    const recognitionText = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${recognition.userId}>: ${recognition.recognitionCount} recognitions`,
      },
    };

    recognitionsList.push(recognitionText);
  }

  blocks.push(
    ...userBalance,
    divider,
    recognitionsListHeader,
    ...recognitionsList
  );

  if (isAdmin) {
    blocks.splice(0, 0, settingsButton, divider);
  }

  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks,
      },
    });
  } catch (error) {
    logger.error('appHomeOpenedCallback()', { error });
  }
};

export default appHomeOpenedCallback;
