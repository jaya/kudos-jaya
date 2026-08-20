import logger from '@/utils/logger';
import { HomePageService } from '../../services/home-page.service';
import { withRequestContext } from '@/context';

const appHomeOpenedHandler = withRequestContext(async ({ client, event }) => {
  try {
    // Ignore the `app_home_opened` event for anything but the Home tab
    if (event.tab !== 'home') return;

    const { user } = event;

    const service = new HomePageService();
    const result = await service.buildHomePageBlocks({
      user,
    });

    // Use raw client for home tab publishing (Slack-specific feature)
    // TODO: Extend adapter interface to support home tab publishing
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
});

export default appHomeOpenedHandler;
