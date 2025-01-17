import { RecognitionController } from '@/controllers/recognition';
import { WalletController } from '@/controllers/wallet';
import logger from '@/utils/logger';
import { isUserAdmin } from '@/utils/user-slack-info';
import config from 'config';

const appHomeOpenedCallback = async ({ client, event }) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') return;
  const recsController = new RecognitionController();

  //TODO: passar o teamId em todas as consultas
  const teamId = event?.view?.app_installed_team_id;
  const recognitions = await recsController.getTotal({
    userId: event.user,
    teamId,
  });
  const totalRecognitions = await recsController.getTotal({ teamId });
  const balance = await new WalletController().getBalance(event.user);
  const recognitionSummary = await recsController.getUsersRecognitionSummary(
    teamId
  );
  const isAdmin = await isUserAdmin(client.token, event.user);

  const blocks = [];

  const userBalance = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:trophy: <@${event.user}>, your prizes balance :trophy: 
      *Recognitions*: ${recognitions}
      *Balance*: R$ ${balance}`,
    },
  };

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
      //TODO: buscar do banco o canal padrao
      text: `:sports_medal: ${config.get<string>(
        'app.recognition.defaultChannel'
      )} ${totalRecognitions} recognitions :sports_medal:`,
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
    userBalance,
    divider,
    recognitionsListHeader,
    ...recognitionsList
  );

  //TODO: ajustar layout quando tem o botao redeem tambem
  if (isAdmin) {
    blocks.splice(0, 0, settingsButton, divider);
  }

  if (balance > 0) {
    blocks.splice(1, 0, redeemButton);
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
