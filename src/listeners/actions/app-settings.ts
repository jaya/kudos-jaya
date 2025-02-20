import { InstallationController } from '@/controllers';
import logger from '@/utils/logger';

const appSettingsButtonCallback = async ({ ack, client, body }) => {
  try {
    await ack();

    const teamId = body.user.team_id;

    const {
      giftCardApiTokenHint,
      defaultChannelHint,
      defaultAmountHint,
      alreadyInstalled,
    } = await new InstallationController().getCurrentSettings(teamId);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'settings_view',
        title: {
          type: 'plain_text',
          text: 'App Settings',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'setup_todo_token',
            optional: alreadyInstalled,
            label: {
              type: 'plain_text',
              text: 'Fill in the field below with the token provided by Todo Cartões',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'todo_token',
              multiline: true,
            },
            hint: {
              type: 'plain_text',
              text: giftCardApiTokenHint,
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'setup_default_channel_id',
            optional: alreadyInstalled,
            element: {
              type: 'plain_text_input',
              action_id: 'default_channel_id',
            },
            label: {
              type: 'plain_text',
              text: 'Default channel for the app to send kudos messages',
              emoji: true,
            },
            hint: {
              type: 'plain_text',
              text: defaultChannelHint,
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'setup_default_amount',
            optional: alreadyInstalled,
            element: {
              type: 'number_input',
              is_decimal_allowed: true,
              action_id: 'default_amount',
              min_value: '10',
            },
            label: {
              type: 'plain_text',
              text: 'Default amount to add to the wallet when someone receives a kudo.',
              emoji: true,
            },
            hint: {
              type: 'plain_text',
              text: defaultAmountHint,
              emoji: true,
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Finish',
        },
      },
    });
  } catch (error) {
    logger.error('finishInstallButtonCallback()', { error });
  }
};

export default appSettingsButtonCallback;
