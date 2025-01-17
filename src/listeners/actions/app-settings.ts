import logger from '@/utils/logger';

const appSettingsButtonCallback = async ({ ack, client, body }) => {
  try {
    await ack();
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
              text: 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'setup_default_channel_id',
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
              text: 'Enter the default Slack channel id (ex: C93LZNJ64).',
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
