import chooseCardActionHandler from '../../handlers/choose-card-action';
import * as amountInputModal from '../../ui/amount-input-modal';

jest.mock('../../ui/amount-input-modal');
jest.mock('@/utils/logger');

describe('chooseCardActionHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      views: {
        update: jest.fn(),
      },
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
    };

    (amountInputModal.getAmountInputView as jest.Mock).mockReturnValue({
      type: 'modal',
      callback_id: 'generate_gift_card',
    });
  });

  it('should update modal with amount input', async () => {
    await chooseCardActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(amountInputModal.getAmountInputView).toHaveBeenCalledWith(
      'card1',
      '50',
      '500',
    );
    expect(mockClient.views.update).toHaveBeenCalled();
  });

  it('should pass correct view_id and hash', async () => {
    await chooseCardActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockClient.views.update).toHaveBeenCalledWith(
      expect.objectContaining({
        view_id: 'view123',
        hash: 'hash123',
      }),
    );
  });
});
