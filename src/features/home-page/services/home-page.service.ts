import { HomePageParams, HomePageBlocksResult } from '../types';
import { getHomePageBlocks } from '../ui/slack/home-blocks';

export class HomePageService {
  async buildHomePageBlocks(
    params: HomePageParams,
  ): Promise<HomePageBlocksResult> {
    return getHomePageBlocks(params);
  }
}
