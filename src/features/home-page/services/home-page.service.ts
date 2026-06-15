import { HomePageBlocksResult } from '../types';
import { RequestContext } from '@/context';
import { getHomePageBlocks } from '../ui/home-blocks';

export class HomePageService {
  async buildHomePageBlocks(user: string): Promise<HomePageBlocksResult> {
    const { teamId, botToken } = RequestContext.get();
    return getHomePageBlocks({
      user,
      teamId,
      token: botToken,
    });
  }
}
