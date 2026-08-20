import { HomePageService } from '../services/home-page.service';
import * as homeBlocks from '../ui/slack/home-blocks';
import { RequestContext } from '@/context';

jest.mock('../ui/slack/home-blocks');
jest.mock('@/utils/logger');
jest.mock('@/context');

describe('HomePageService', () => {
  let service: HomePageService;

  beforeEach(() => {
    jest.clearAllMocks();

    (RequestContext.get as jest.Mock).mockReturnValue({
      teamId: 'team1',
      botToken: 'token123',
    });

    service = new HomePageService();
  });

  describe('buildHomePageBlocks', () => {
    it('should build home page blocks successfully', async () => {
      const mockBlocks = [
        { type: 'section', text: { type: 'mrkdwn', text: 'Admin panel' } },
        { type: 'divider' },
      ];
      const mockResult = {
        blocks: mockBlocks,
        hasError: false,
      };

      (homeBlocks.getHomePageBlocks as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.buildHomePageBlocks({
        user: 'user1',
      });

      expect(result).toEqual(mockResult);
      expect(homeBlocks.getHomePageBlocks).toHaveBeenCalledWith({
        user: 'user1',
        teamId: 'team1',
        token: 'token123',
      });
    });

    it('should handle error when building blocks', async () => {
      const mockResult = {
        blocks: [],
        hasError: true,
        errorMessage: 'Failed to load home page',
      };

      (homeBlocks.getHomePageBlocks as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.buildHomePageBlocks({
        user: 'user1',
      });

      expect(result.hasError).toBe(true);
      expect(result.errorMessage).toBe('Failed to load home page');
    });
  });
});
