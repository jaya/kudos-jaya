import cancelKudosCommandHandler from '../../handlers/cancel-kudos-command';
import { CancelKudosService } from '../../services/cancel-kudos.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../services/cancel-kudos.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('cancelKudosCommandHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockAdapter = {
      postMessage: jest.fn().mockResolvedValue(undefined),
      openModal: jest.fn().mockResolvedValue(undefined),
    };
    mockBody = {
      team_id: 'team123',
      user_id: 'user1',
      trigger_id: 'trigger123',
    };

    mockService = {
      getUserKudos: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (CancelKudosService as jest.Mock).mockImplementation(() => mockService);

    // Mock RequestContext.get() to return context with adapter
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });

    // Mock RequestContext.runAsync to call the handler directly
    (RequestContext.runAsync as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context: any, fn: any) => fn(),
    );
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
      body: mockBody,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.openModal).toHaveBeenCalled();
    expect(mockAdapter.postMessage).not.toHaveBeenCalled();
  });

  it('should send message when no kudos exist', async () => {
    mockService.getUserKudos.mockResolvedValue([]);

    await cancelKudosCommandHandler({
      ack: mockAck,
      body: mockBody,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'You have no kudos to cancel.',
      }),
    );
  });
});
