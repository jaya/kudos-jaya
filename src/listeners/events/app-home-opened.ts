import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { InstallationController } from '@/controllers/installation';
import { decrypt } from '@/utils/encrypt';
import logger from '@/utils/logger';
import { getAdminPanelSection } from './home/components/admin-panel';
import { getRecognitionListSection } from './home/components/recognition-list';
import { getUserBalanceSection } from './home/components/user-balance';

const appHomeOpenedCallback = async ({ client, event }) => {
  try {
    // Ignore the `app_home_opened` event for anything but the Home tab
    if (event.tab !== 'home') return;
    const { user } = event;
    const { token } = client;
    const teamId = event?.view?.app_installed_team_id;

    const { giftCardApiToken } = await new InstallationController().find(
      teamId,
    );

    const adminPanel = await getAdminPanelSection({
      token,
      user,
      teamId,
    });

    if (!giftCardApiToken) {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: 'home',
          blocks: [
            ...adminPanel,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'Contact your admin to set up a valid token.',
              },
            },
          ],
        },
      });
      return;
    }

    const res = await new TodoCartoes(
      undefined,
      decrypt(giftCardApiToken),
    ).fetchProducts();

    if (res.status !== 200) {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: 'home',
          blocks: [
            ...adminPanel,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'There is a problem with the configured token. Please contact your admin to configure it correctly.',
              },
            },
          ],
        },
      });
      return;
    }

    const userBalance = await getUserBalanceSection({
      user,
      teamId,
    });

    const recognitionsList = await getRecognitionListSection({
      teamId,
    });

    const blocks = [...adminPanel, ...userBalance, ...recognitionsList];

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
