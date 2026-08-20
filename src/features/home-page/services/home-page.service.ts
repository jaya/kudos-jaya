import { RequestContext } from '@/context';
import { HomePageParams, HomePageBlocksResult } from '../types';
import { getHomePageBlocks } from '../ui/slack/home-blocks';

export class HomePageService {
  async buildHomePageBlocks(
    params: Omit<HomePageParams, 'teamId' | 'token'>,
  ): Promise<HomePageBlocksResult> {
    const { teamId, botToken } = RequestContext.get();
    return getHomePageBlocks({
      ...params,
      teamId,
      token: botToken,
    });
  }
}
