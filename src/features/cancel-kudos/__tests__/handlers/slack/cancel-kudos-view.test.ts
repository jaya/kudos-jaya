import cancelKudosViewHandler from '../../../handlers/slack/cancel-kudos-view';
import { CancelKudosService } from '../../../services/cancel-kudos.service';

jest.mock('../../../services/cancel-kudos.service');
jest.mock('@/utils/logger');

describe('cancelKudosViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        postMessage: jest.fn(),
        deleteMessage: jest.fn(),
        delete: jest.fn(),
      },
      views: {
        update: jest.fn(),
      },
    };
    mockBody = {
      team_id: 'team123',
      user: {
        team_id: 'team123',
      },
      user_id: 'user1',
      view: {
        id: 'view123',
        state: {
          values: {
            cancel_kudos_block: {
              cancel_kudos: {
                selected_options: [
                  {
                    value: 'msg123,ch123',
                  },
                ],
              },
            },
          },
        },
      },
    };

    mockService = {
      deleteKudos: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (CancelKudosService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should delete kudos and show success message', async () => {
    mockService.deleteKudos.mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockContext: any = {
      botToken: 'token123',
    };

    await cancelKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.deleteKudos).toHaveBeenCalled();
    expect(mockClient.chat.delete).toHaveBeenCalled();
  });

  it('should handle delete failure gracefully', async () => {
    mockService.deleteKudos.mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockContext: any = {
      botToken: 'token123',
    };

    await cancelKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.deleteKudos).toHaveBeenCalled();
  });

  it('should extract correct message id and channel id from selected option', async () => {
    mockService.deleteKudos.mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockContext: any = {
      botToken: 'token123',
    };

    await cancelKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockService.deleteKudos).toHaveBeenCalledWith(
      'team123',
      'msg123',
      'ch123',
    );
  });
});
