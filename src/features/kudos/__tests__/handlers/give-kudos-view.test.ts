import giveKudosViewHandler from '../../handlers/give-kudos-view';
import { GiveKudosService } from '../../services/give-kudos.service';

jest.mock('../../services/give-kudos.service');
jest.mock('@/utils/logger');

describe('giveKudosViewHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockView: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        postMessage: jest.fn(),
      },
    };
    mockBody = {
      team: {
        id: 'team123',
        domain: 'example-workspace',
      },
      user: {
        id: 'user1',
      },
    };
    mockView = {
      state: {
        values: {
          to_id_block: {
            to_id: {
              selected_users: ['user2', 'user3'],
            },
          },
          kudo_message_block: {
            kudo_message: {
              value: 'Great work!',
            },
          },
          company_values_block: {
            company_values_select_action: {
              selected_options: [],
            },
          },
        },
      },
      blocks: [
        { block_id: 'some_block' },
        { block_id: 'gif_block', image_url: 'https://example.com/gif.gif' },
      ],
    };

    mockService = {
      validateMonthlyLimit: jest.fn(),
      createRecognitions: jest.fn(),
      getDefaultRecognitionChannel: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (GiveKudosService as jest.Mock).mockImplementation(() => mockService);
  });

  it('should create recognitions and send confirmation message', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
      remaining: 5,
    });
    mockService.createRecognitions.mockResolvedValue([
      { id: 'rec1', success: true, toId: 'user2' },
      { id: 'rec2', success: true, toId: 'user3' },
    ]);
    mockService.getDefaultRecognitionChannel.mockResolvedValue('C12345');

    await giveKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockView,
      context: { botToken: 'xoxb-test-token' },
    });

    expect(mockAck).toHaveBeenCalled();
    expect(mockService.createRecognitions).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).toHaveBeenCalledTimes(3); // 2 notifications + 1 confirmation
  });

  it('should send error message when validation fails', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
      message: 'Monthly limit reached',
    });

    await giveKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockView,
      context: { botToken: 'xoxb-test-token' },
    });

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'Monthly limit reached',
      }),
    );
    expect(mockService.createRecognitions).not.toHaveBeenCalled();
  });

  it('should handle partial failures', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
      remaining: 5,
    });
    mockService.createRecognitions.mockResolvedValue([
      { id: 'rec1', success: true, toId: 'user2' },
      { id: '', success: false, toId: 'user3' },
    ]);
    mockService.getDefaultRecognitionChannel.mockResolvedValue('C12345');

    await giveKudosViewHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      view: mockView,
      context: { botToken: 'xoxb-test-token' },
    });

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: expect.stringContaining('error occurred'),
      }),
    );
  });
});
