import logger from '@/utils/logger';

const finishInstallButtonCallback = async ({ ack, client, body }) => {
  try {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'finish_install_view',
        title: {
          type: 'plain_text',
          text: 'Finish install',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'setup_todo_token',
            label: {
              type: 'plain_text',
              text: 'Fill in the field below with the token provided by Todo Cartões.\n Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'finish_install',
              multiline: true,
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

export default finishInstallButtonCallback;
