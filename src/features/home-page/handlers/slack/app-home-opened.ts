import logger from '@/utils/logger';
import { HomePageService } from '../../services/home-page.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const appHomeOpenedHandler = withRequestContext(async ({ event }) => {
  try {
    // Ignore the `app_home_opened` event for anything but the Home tab
    if (event.tab !== 'home') return;

    const { user } = event;
    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

    const service = new HomePageService();
    const result = await service.buildHomePageBlocks({
      user,
    });

    await adapter.publishHomeTab({
      userId: event.user,
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
