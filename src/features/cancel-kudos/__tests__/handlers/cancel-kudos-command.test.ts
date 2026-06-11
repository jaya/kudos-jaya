import cancelKudosCommandHandler from '../../handlers/cancel-kudos-command';
import { CancelKudosService } from '../../services/cancel-kudos.service';

jest.mock('../../services/cancel-kudos.service');
jest.mock('@/utils/logger');

describe('cancelKudosCommandHandler', () => {
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
        postEphemeral: jest.fn(),
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
      getUserKudos: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (CancelKudosService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should open cancel kudos modal when kudos exist', async () => {
    const mockKudos = [
      {
        id: 1,
        fromId: 'user1',
        toId: 'user2',
        slackMessageId: 'msg123',
        slackChannelId: 'ch123',
      },
      {
        id: 2,
        fromId: 'user1',
        toId: 'user3',
        slackMessageId: 'msg456',
        slackChannelId: 'ch456',
      },
    ];

    mockService.getUserKudos.mockResolvedValue(mockKudos);

    await cancelKudosCommandHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.views.open).toHaveBeenCalled();
    expect(mockClient.chat.postEphemeral).not.toHaveBeenCalled();
  });

  it('should send ephemeral message when no kudos exist', async () => {
    mockService.getUserKudos.mockResolvedValue([]);

    await cancelKudosCommandHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.chat.postEphemeral).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'You have no kudos to cancel.',
      }),
    );
  });
});
