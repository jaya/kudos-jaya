import logger from '../logger';

export async function sendFinishInstallMessage(client, token, user) {
  try {
    //TODO: checar se o usuário é um admin, se sim enviar a mensagem, senao, avisa-lo
    await client.chat.postMessage({
      token,
      channel: user,
      text: '',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Click the button below to finish installing the app',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Finish Install',
                emoji: true,
              },
              //TODO: salvar na tabela de installation o token
              action_id: 'finish_install',
            },
          ],
        },
      ],
    });
  } catch (error) {
    logger.error('Error while sending finish install message', error);
  }
}
