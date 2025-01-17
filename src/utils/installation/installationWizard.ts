import { InstallationController } from '@/controllers/installation';
import { Installation } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import logger from '../logger';
import { isUserAdmin } from '../user-slack-info';
const installationController = new InstallationController();

export const storeInstallation = async (installation): Promise<void> => {
  const userId = installation?.user?.id;
  const botToken = installation?.bot?.token;

  const isAdmin = await isUserAdmin(botToken, userId);

  if (!isAdmin) {
    await sendNotAdminMessage(botToken, userId);
  }

  if (installation.team) {
    await installationController.create(installation);
  }

  if (botToken && installation.team?.id && isAdmin) {
    await sendFinishInstallMessage(botToken, userId);
  }
};

export const fetchInstallation = async (
  installQuery
): Promise<Installation<'v1' | 'v2', boolean>> => {
  if (installQuery.isEnterpriseInstall && installQuery?.enterpriseId) {
    return (await installationController.find(
      installQuery.enterpriseId
    )) as unknown as Installation<'v1' | 'v2', boolean>;
  }

  if (installQuery?.teamId) {
    const storedInstallation = await installationController.find(
      installQuery.teamId
    );
    if (!storedInstallation) {
      throw new Error('Failed fetching installation');
    } else
      return storedInstallation as unknown as Installation<
        'v1' | 'v2',
        boolean
      >;
  }
  throw new Error('Failed fetching installation');
};

export async function sendFinishInstallMessage(
  token: string,
  user: string
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

export async function sendNotAdminMessage(
  token: string,
  user: string
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
