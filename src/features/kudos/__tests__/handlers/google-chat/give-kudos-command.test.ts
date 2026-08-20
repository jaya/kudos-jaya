// Mock handler context BEFORE importing handlers
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@/context/handler-context', () => ({
  withRequestContext: (handler: any) => handler,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

import giveKudosCommandHandler from '../../../handlers/google-chat/give-kudos-command';
import { GiveKudosService } from '../../../services/give-kudos.service';
import { RequestContext } from '@/context/RequestContext';
import * as givKudosModal from '../../../ui/slack/give-kudos-modal';

jest.mock('../../../services/give-kudos.service');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');
jest.mock('../../../ui/slack/give-kudos-modal');

describe('giveKudosCommandHandler (Google Chat)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockParams: any = {
    userId: 'user1',
    triggerId: 'trigger123',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = {
      postMessage: jest.fn().mockResolvedValue(undefined),
      openModal: jest.fn().mockResolvedValue(undefined),
    };

    mockService = {
      validateMonthlyLimit: jest.fn(),
      fetchGif: jest.fn(),
      getCompanyValues: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    (GiveKudosService as jest.Mock).mockImplementation(() => mockService);

    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: mockAdapter,
    });

    (givKudosModal.buildCompanyValueOptions as jest.Mock).mockReturnValue([]);
    (givKudosModal.getKudosView as jest.Mock).mockReturnValue({
      type: 'modal',
    });
  });

  it('should open modal when user can give kudos', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: true,
      remaining: 5,
    });
    mockService.fetchGif.mockResolvedValue('https://example.com/gif.gif');
    mockService.getCompanyValues.mockResolvedValue(['Innovation', 'Teamwork']);

    await giveKudosCommandHandler(mockParams);

    expect(mockService.validateMonthlyLimit).toHaveBeenCalledWith('user1');
    expect(mockService.fetchGif).toHaveBeenCalled();
    expect(mockService.getCompanyValues).toHaveBeenCalled();
    expect(mockAdapter.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerId: 'trigger123',
        view: expect.any(Object),
      }),
    );
  });

  it('should send message when user cannot give kudos', async () => {
    const validationMessage = 'You have reached your monthly limit';
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
      message: validationMessage,
    });

    await giveKudosCommandHandler(mockParams);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: validationMessage,
      }),
    );
    expect(mockAdapter.openModal).not.toHaveBeenCalled();
  });

  it('should send default message when validation fails without message', async () => {
    mockService.validateMonthlyLimit.mockResolvedValue({
      canGive: false,
    });

    await giveKudosCommandHandler(mockParams);

    expect(mockAdapter.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'user1',
        text: 'You cannot give kudos at this time',
      }),
    );
  });

  it('should handle errors gracefully', async () => {
    mockService.validateMonthlyLimit.mockRejectedValue(
      new Error('Service error'),
    );

    await giveKudosCommandHandler(mockParams);

    expect(mockAdapter.openModal).not.toHaveBeenCalled();
  });

  it('should throw error if adapter is not available', async () => {
    (RequestContext.get as jest.Mock).mockReturnValue({
      adapter: undefined,
    });

    await giveKudosCommandHandler(mockParams);

    expect(mockAdapter.openModal).not.toHaveBeenCalled();
  });
});
