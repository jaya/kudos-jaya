import logger from '@/utils/logger';
import { HomePageService } from '../services/home-page.service';

const appHomeOpenedHandler = async ({ client, event }) => {
  try {
    // Ignore the `app_home_opened` event for anything but the Home tab
    if (event.tab !== 'home') return;

    const { user } = event;
    const { token } = client;
    const teamId = event?.view?.app_installed_team_id;

    const service = new HomePageService();
    const result = await service.buildHomePageBlocks({
      user,
      teamId,
      token,
    });

    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: result.blocks,
      },
    });
  } catch (error) {
    logger.error('appHomeOpenedHandler()', error);
  }
};

export default appHomeOpenedHandler;
