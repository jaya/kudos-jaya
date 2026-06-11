import { HomePageParams, HomePageBlocksResult } from '../types';
import { getHomePageBlocks } from '../ui/home-blocks';

export class HomePageService {
  async buildHomePageBlocks(
    params: HomePageParams,
  ): Promise<HomePageBlocksResult> {
    return getHomePageBlocks(params);
  }
}
