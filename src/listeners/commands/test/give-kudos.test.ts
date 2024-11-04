import logger from '@/utils/logger';
import { openKudosView } from '@/views/give-kudos';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import giveKudosCommandCallback from '../give-kudos';

jest.mock('@/views/give-kudos', () => ({
  openKudosView: jest.fn(),
}));

describe('giveKudosCommandCallback', () => {
  const mockAck = jest.fn();
  const mockClient = {};
  const mockBody = {};
  const mockContext = {};

  const commandArgs = {
    ack: mockAck,
    client: mockClient,
    body: mockBody,
    context: mockContext,
  } as unknown as AllMiddlewareArgs & SlackCommandMiddlewareArgs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should acknowledge the Slack command with ack()', async () => {
    await giveKudosCommandCallback(commandArgs);

    expect(mockAck).toHaveBeenCalledTimes(1);
  });

  it('should call openKudosView with correct parameters', async () => {
    await giveKudosCommandCallback(commandArgs);

    expect(openKudosView).toHaveBeenCalledWith({
      client: mockClient,
      body: mockBody,
      context: mockContext,
    });
  });

  it('should handle errors by logging them', async () => {
    const consoleSpy = jest.spyOn(logger, 'error').mockImplementation();
    const errorMessage = 'Test error';

    (openKudosView as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await giveKudosCommandCallback(commandArgs);

    expect(consoleSpy).toHaveBeenCalledWith(
      'giveKudosCommandCallback()',
      new Error(errorMessage)
    );

    consoleSpy.mockRestore();
  });
});
