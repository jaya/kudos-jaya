/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecognitionController } from '@/controllers';
import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { IsNull, Not } from 'typeorm';
import cancelKudosCommandCallback, {
  getCancelKudosView,
} from '../cancel-kudos';
import { mockRecognitions } from './samples/cancel-kudos';

jest.mock('@/controllers');
jest.mock('@/utils/logger');

const mockedRecognitionController = jest.mocked(RecognitionController);
const mockedLogger = jest.mocked(logger);

const createMockMiddlewareArgs = (
  overrides?: Partial<AllMiddlewareArgs & SlackCommandMiddlewareArgs>,
) => {
  return {
    ack: jest.fn(),
    client: {
      chat: {
        postEphemeral: jest.fn().mockResolvedValue(undefined),
      },
      views: {
        open: jest.fn().mockResolvedValue(undefined),
      },
    } as any,
    body: {
      team_id: 'testTeamId',
      user_id: 'testUserId',
      trigger_id: 'testTriggerId',
      command: '/cancel-kudos',
    } as any,
    context: {
      botToken: 'testBotToken',
    } as any,
    ...overrides,
  };
};

describe('cancelKudosCommandCallback', () => {
  let mockArgs;

  beforeEach(() => {
    jest.clearAllMocks();
    mockArgs = createMockMiddlewareArgs();
  });

  it('should call ack', async () => {
    await cancelKudosCommandCallback(mockArgs);
    expect(mockArgs.ack).toHaveBeenCalledTimes(1);
  });

  it('should call RecognitionController.find with correct parameters', async () => {
    await cancelKudosCommandCallback(mockArgs);
    expect(mockedRecognitionController.prototype.find).toHaveBeenCalledWith({
      teamId: 'testTeamId',
      params: { fromId: 'testUserId', slackMessageId: Not(IsNull()) },
    });
  });

  it('should post an ephemeral message if no kudos are found', async () => {
    mockedRecognitionController.prototype.find.mockResolvedValue([]);
    await cancelKudosCommandCallback(mockArgs);
    expect(mockArgs.client.chat.postEphemeral).toHaveBeenCalledWith({
      token: 'testBotToken',
      channel: 'testUserId',
      user: 'testUserId',
      text: 'You have no kudos to cancel.',
    });
    expect(mockArgs.client.views.open).not.toHaveBeenCalled();
  });

  it('should open a view with the correct recognitions if kudos are found', async () => {
    mockedRecognitionController.prototype.find.mockResolvedValue(
      mockRecognitions,
    );
    const expectedView = getCancelKudosView(mockRecognitions);
    await cancelKudosCommandCallback(mockArgs);
    expect(mockArgs.client.views.open).toHaveBeenCalledWith({
      token: 'testBotToken',
      trigger_id: 'testTriggerId',
      view: expectedView,
    });
    expect(mockArgs.client.chat.postEphemeral).not.toHaveBeenCalled();
  });

  it('should log an error if an exception occurs', async () => {
    const mockError = new Error('Test error');
    mockedRecognitionController.prototype.find.mockRejectedValue(mockError);
    await cancelKudosCommandCallback(mockArgs);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'cancelKudosCommandCallback()',
      mockError,
    );
    expect(mockArgs.ack).toHaveBeenCalledTimes(1);
  });
});
