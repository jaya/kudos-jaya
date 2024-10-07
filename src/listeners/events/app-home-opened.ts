import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import config from 'config';
import { RecognitionController } from '../../controllers/recognition';
import { WalletController } from '../../controllers/wallet';

const appHomeOpenedCallback = async ({
  client,
  event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_home_opened'>) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') return;
  const recsController = new RecognitionController();

  const recognitions = await recsController.getTotal(event.user);
  const totalRecognitions = await recsController.getTotal();
  const balance = await new WalletController().getBalance(event.user);
  const recognitionSummary = await recsController.getUsersRecognitionSummary();

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
        value: 'redeem',
        action_id: 'redeem_button',
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
      text: `:sports_medal: <#${config.get<string>(
        'app.recognition.defaultChannel'
      )}> ${totalRecognitions} recognitions :sports_medal:`,
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
    console.error(error);
  }
};

export default appHomeOpenedCallback;
