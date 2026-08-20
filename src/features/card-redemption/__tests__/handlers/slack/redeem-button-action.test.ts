import redeemButtonActionHandler from '../../../handlers/slack/redeem-button-action';
import * as productListModal from '../../../ui/slack/product-list-modal';

jest.mock('../../../ui/slack/product-list-modal');
jest.mock('@/utils/logger');

describe('redeemButtonActionHandler', () => {
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
        open: jest.fn(),
      },
    };
    mockBody = {
      trigger_id: 'trigger123',
    };

    (productListModal.getProductListBlocks as jest.Mock).mockResolvedValue([
      { type: 'section', text: { type: 'mrkdwn', text: 'Product 1' } },
    ]);

    (productListModal.getProductListView as jest.Mock).mockReturnValue({
      type: 'modal',
      title: { type: 'plain_text', text: 'Generate Gift Card' },
    });
  });

  it('should open product list modal', async () => {
    await redeemButtonActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(productListModal.getProductListBlocks).toHaveBeenCalledWith(1);
    expect(mockClient.views.open).toHaveBeenCalled();
  });

  it('should pass correct trigger_id to views.open', async () => {
    await redeemButtonActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockClient.views.open).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_id: 'trigger123',
      }),
    );
  });
});
