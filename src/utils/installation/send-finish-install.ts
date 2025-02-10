import logger from '@/utils/logger';
import { WebClient } from '@slack/web-api';

export async function sendFinishInstallMessage(
  token: string,
  user: string,
): Promise<void> {
  try {
    const client = new WebClient(token);

    await client.chat.postMessage({
      token,
      channel: user,
      text: 'Click the button below to finish installing the app',
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
              action_id: 'app_settings',
            },
          ],
        },
      ],
    });
  } catch (error) {
    logger.error('Error while sending finish install message', error);
  }
}
