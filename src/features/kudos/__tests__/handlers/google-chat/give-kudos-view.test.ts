// Mock handler context BEFORE importing handlers
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@/context/handler-context', () => ({
  withRequestContext: (handler: any) => handler,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

import giveKudosViewHandler from '../../../handlers/google-chat/give-kudos-view';
import { GiveKudosService } from '../../../services/give-kudos.service';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../../services/give-kudos.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('giveKudosViewHandler (Google Chat)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockParams: any = {
    userId: 'user1',
    formData: {
      to_ids: ['user2', 'user3'],
      message: 'Great work!',
      gif_url: 'https://example.com/gif.gif',
      company_values: ['Innovation', 'Teamwork'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = {
      postMessage: jest
        .fn()
        .mockResolvedValue({ ts: 'msg123', channel: 'channel123' }),
    };

    mockService = {
      validateMonthlyLimit: jest.fn(),
      getDefaultRecognitionChannel: jest.fn(),
      createRecognitionsWithSlackIds: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (GiveKudosService as jest.Mock).mockImplementation(() => mockService);

    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });
  });

  it('should post message and create recognitions when user can give kudos', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
    });
    mockService.getDefaultRecognitionChannel.mockResolvedValue('general');
    mockService.createRecognitionsWithSlackIds.mockResolvedValue([
      { success: true, toId: 'user2' },
      { success: true, toId: 'user3' },
    ]);

    await giveKudosViewHandler(mockParams);

    expect(mockService.validateMonthlyLimit).toHaveBeenCalledWith('user1');
    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'general',
        text: expect.stringContaining('is recognizing'),
        blocks: expect.any(Array),
      }),
    );
    expect(mockService.createRecognitionsWithSlackIds).toHaveBeenCalledWith(
      expect.objectContaining({
        fromId: 'user1',
        toIds: ['user2', 'user3'],
        message: 'Great work!',
        slackMessageId: 'msg123',
        slackChannelId: 'channel123',
      }),
    );
  });

  it('should send notifications to recipients after creating recognitions', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
    });
    mockService.getDefaultRecognitionChannel.mockResolvedValue('general');
    mockService.createRecognitionsWithSlackIds.mockResolvedValue([
      { success: true, toId: 'user2' },
      { success: true, toId: 'user3' },
    ]);

    await giveKudosViewHandler(mockParams);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const notificationCalls = mockAdapter.postMessage.mock.calls.filter(
      (call: any[]) =>
        call[0].text && call[0].text.includes('Jaya is sending you a gift'),
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(notificationCalls.length).toBe(2);
  });

  it('should send error message when user cannot give kudos', async () => {
    const validationMessage = 'You have reached your monthly limit';
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
      message: validationMessage,
    });

    await giveKudosViewHandler(mockParams);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: validationMessage,
      }),
    );
  });

  it('should send error message when user cannot give kudos (default message)', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
    });

    await giveKudosViewHandler(mockParams);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: expect.stringContaining('reached your monthly kudos limit'),
      }),
    );
  });

  it('should send error message when some recognitions fail', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
    });
    mockService.getDefaultRecognitionChannel.mockResolvedValue('general');
    mockService.createRecognitionsWithSlackIds.mockResolvedValue([
      { success: true, toId: 'user2' },
      { success: false, toId: 'user3' },
    ]);

    await giveKudosViewHandler(mockParams);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: expect.stringContaining('An error occurred'),
      }),
    );
  });

  it('should handle errors gracefully', async () => {
    mockService.validateMonthlyLimit.mockRejectedValue(
      new Error('Service error'),
    );

    await giveKudosViewHandler(mockParams);

    expect(mockAdapter.postMessage).not.toHaveBeenCalled();
  });

  it('should throw error if adapter is not available', async () => {
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: undefined,
    });

    await giveKudosViewHandler(mockParams);

    expect(mockAdapter.postMessage).not.toHaveBeenCalled();
  });
});
