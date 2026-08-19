import chooseCardActionHandler from '../../handlers/choose-card-action';
import * as amountInputModal from '../../ui/amount-input-modal';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../ui/amount-input-modal');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('chooseCardActionHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockAdapter = {
      updateModal: jest.fn().mockResolvedValue(undefined),
    };
    mockBody = {
      view: {
        id: 'view123',
        hash: 'hash123',
      },
      actions: [
        {
          value: 'card1,50,500',
        },
      ],
      user: {
        team_id: 'T123',
      },
    };

    (amountInputModal.getAmountInputView as jest.Mock).mockReturnValue({
      type: 'modal',
      callback_id: 'generate_gift_card',
    });

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

  it('should update modal with amount input', async () => {
    await chooseCardActionHandler({
      ack: mockAck,
      body: mockBody,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(amountInputModal.getAmountInputView).toHaveBeenCalledWith(
      'card1',
      '50',
      '500',
    );
    expect(mockAdapter.updateModal).toHaveBeenCalled();
  });

  it('should pass correct view_id to adapter', async () => {
    await chooseCardActionHandler({
      ack: mockAck,
      body: mockBody,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAdapter.updateModal).toHaveBeenCalledWith(
      expect.objectContaining({
        viewId: 'view123',
      }),
    );
  });
});
