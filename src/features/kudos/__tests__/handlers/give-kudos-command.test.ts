import giveKudosCommandHandler from '../../handlers/give-kudos-command';
import { GiveKudosService } from '../../services/give-kudos.service';

jest.mock('../../services/give-kudos.service');
jest.mock('@/utils/logger');

describe('giveKudosCommandHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        postMessage: jest.fn(),
      },
      views: {
        open: jest.fn(),
      },
    };
    mockBody = {
      team_id: 'team123',
      user_id: 'user1',
      trigger_id: 'trigger123',
    };
    mockContext = {
      botToken: 'token123',
    };

    mockService = {
      validateMonthlyLimit: jest.fn(),
      fetchGif: jest.fn(),
      getCompanyValues: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (GiveKudosService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should open kudos modal when validation passes', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
      remaining: 5,
    });
    mockService.fetchGif.mockResolvedValue('https://example.com/gif.gif');
    mockService.getCompanyValues.mockResolvedValue('Innovation, Teamwork');

    await giveKudosCommandHandler({
      ack: mockAck,

      client: mockClient,

      body: mockBody,

      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.views.open).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).not.toHaveBeenCalled();
  });

  it('should send error message when validation fails', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
      message: 'Monthly limit reached',
    });

    await giveKudosCommandHandler({
      ack: mockAck,

      client: mockClient,

      body: mockBody,

      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Monthly limit reached',
      }),
    );
    expect(mockClient.views.open).not.toHaveBeenCalled();
  });
});
