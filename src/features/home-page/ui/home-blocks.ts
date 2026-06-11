import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import { InstallationController } from '@/controllers/installation';
import { UserController } from '@/controllers/user';
import { decrypt } from '@/utils/encrypt';
import logger from '@/utils/logger';
import { HomePageParams, HomePageBlocksResult } from '../types';
import { getAdminPanelSection } from './admin-panel';
import { getRecognitionListSection } from './recognition-list';
import { getUserBalanceSection } from './user-balance';

export async function getHomePageBlocks(
  params: HomePageParams,
): Promise<HomePageBlocksResult> {
  const { user, teamId, token } = params;

  try {
    const installationController = new InstallationController();
    const { giftCardApiToken, bot } = await installationController.find(teamId);

    const userController = new UserController();
    await userController.updateEmailIfNull({
      botToken: bot.token,
      teamId,
      userId: user,
    });

    await userController.syncActiveStatus({
      botToken: bot.token,
      teamId,
    });

    const adminPanel = await getAdminPanelSection({
      token,
      user,
      teamId,
    });

    if (!giftCardApiToken) {
      return {
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
        hasError: true,
        errorMessage: 'Gift card API token not configured',
      };
    }

    const res = await new TodoCartoes(
      undefined,
      decrypt(giftCardApiToken),
    ).fetchProducts();

    if (res.status !== 200) {
      return {
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
        hasError: true,
        errorMessage: 'Invalid gift card API token',
      };
    }

    const userBalance = await getUserBalanceSection({
      user,
      teamId,
    });

    const recognitionsList = await getRecognitionListSection({
      teamId,
    });

    const blocks = [...adminPanel, ...userBalance, ...recognitionsList];

    return {
      blocks,
      hasError: false,
    };
  } catch (error) {
    logger.error('getHomePageBlocks()', error);
    return {
      blocks: [],
      hasError: true,
      errorMessage: 'Failed to load home page',
    };
  }
}
