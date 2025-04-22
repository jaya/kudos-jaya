import { RecognitionController } from '@/controllers';
import logger from '@/utils/logger';
import cancelKudosCallback from '../cancel-kudos';

jest.mock('@/controllers');
const mockRecognitionControllerDelete = jest.fn();
(RecognitionController as jest.Mock).mockImplementation(() => ({
  delete: mockRecognitionControllerDelete,
}));

jest.mock('@/utils/logger');
const mockLoggerError = jest.fn();
logger.error = mockLoggerError;

describe('cancelKudosCallback', () => {
  let mockAck;
  let mockClient;
  let mockBody;
  let mockContext;

  beforeEach(() => {
    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      chat: {
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    mockBody = {
      user: {
        team_id: 'T123',
      },
      view: {
        state: {
          values: {
            cancel_kudos_block: {
              cancel_kudos: {
                selected_options: [],
              },
            },
          },
        },
      },
    };
    mockContext = {
      botToken: 'test-token',
    };
    mockRecognitionControllerDelete.mockClear();
    mockClient.chat.delete.mockClear();
    mockLoggerError.mockClear();
  });

  it('should call RecognitionController.delete and client.chat.delete for each selected kudo', async () => {
    mockBody.view.state.values.cancel_kudos_block.cancel_kudos.selected_options =
      [{ value: 'msg1,chan1' }, { value: 'msg2,chan2' }];

    await cancelKudosCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
    });

    expect(mockRecognitionControllerDelete).toHaveBeenCalledTimes(2);
    expect(mockRecognitionControllerDelete).toHaveBeenCalledWith({
      teamId: 'T123',
      params: { slackChannelId: 'chan1', slackMessageId: 'msg1' },
    });
    expect(mockRecognitionControllerDelete).toHaveBeenCalledWith({
      teamId: 'T123',
      params: { slackChannelId: 'chan2', slackMessageId: 'msg2' },
    });

    expect(mockClient.chat.delete).toHaveBeenCalledTimes(2);
    expect(mockClient.chat.delete).toHaveBeenCalledWith({
      token: 'test-token',
      ts: 'msg1',
      channel: 'chan1',
    });
    expect(mockClient.chat.delete).toHaveBeenCalledWith({
      token: 'test-token',
      ts: 'msg2',
      channel: 'chan2',
    });
  });

  it('should handle errors during the process', async () => {
    const mockError = new Error('Test error');
    mockAck.mockRejectedValue(mockError);

    await cancelKudosCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      context: mockContext,
    });

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith(
      'cancelKudosButtonCallback()',
      { error: mockError },
    );
  });
});
