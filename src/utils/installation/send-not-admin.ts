import logger from '@/utils/logger';
import { WebClient } from '@slack/web-api';

export async function sendNotAdminMessage(
  token: string,
  user: string,
): Promise<void> {
  try {
    const client = new WebClient(token);

    await client.chat.postMessage({
      token,
      channel: user,
      text: 'Thank you for installing Kudos Jaya!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Thank you for installing Kudos Jaya! \nFor the app to work correctly, you must be an admin workspace and access the app’s home page to complete the necessary configuration.',
          },
        },
      ],
    });
  } catch (error) {
    logger.error('sendNotAdminMessage()', error);
  }
}
