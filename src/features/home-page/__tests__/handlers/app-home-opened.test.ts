import appHomeOpenedHandler from '../../handlers/app-home-opened';
import { HomePageService } from '../../services/home-page.service';

jest.mock('../../services/home-page.service');
jest.mock('@/utils/logger');

describe('appHomeOpenedHandler', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEvent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      token: 'token123',
      views: {
        publish: jest.fn(),
      },
    };

    mockEvent = {
      tab: 'home',
      user: 'user1',
      view: {
        app_installed_team_id: 'team1',
      },
    };

    mockService = {
      buildHomePageBlocks: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (HomePageService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should publish home page blocks on app home opened', async () => {
    const mockBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: 'Home content' } },
    ];
    mockService.buildHomePageBlocks.mockResolvedValue({
      blocks: mockBlocks,
      hasError: false,
    });

    await appHomeOpenedHandler({
      client: mockClient,
      event: mockEvent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockService.buildHomePageBlocks).toHaveBeenCalledWith({
      user: 'user1',
      teamId: 'team1',
      token: 'token123',
    });

    expect(mockClient.views.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user1',
        view: expect.objectContaining({
          type: 'home',
          blocks: mockBlocks,
        }),
      }),
    );
  });

  it('should ignore non-home tab events', async () => {
    mockEvent.tab = 'messages';

    await appHomeOpenedHandler({
      client: mockClient,
      event: mockEvent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockService.buildHomePageBlocks).not.toHaveBeenCalled();
    expect(mockClient.views.publish).not.toHaveBeenCalled();
  });
});
