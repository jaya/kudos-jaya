import { fetchProductsResponse } from '@/clients/todo-cartoes/test/samples';
import { TodoCartoes } from '@/clients/todo-cartoes/todo-cartoes';
import redeemButtonCallback from '@/listeners/actions/redeem';
import { redeemBlocks } from './samples/redeem';

jest.mock('@/clients/todo-cartoes/todo-cartoes');

describe('redeemButtonCallback', () => {
  const mockAck = jest.fn();
  const mockClient = {
    views: {
      open: jest.fn(),
    },
  };
  const mockBody = {
    trigger_id: 'mockTriggerId',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest.fn().mockResolvedValue(fetchProductsResponse),
    }));
  });

  it('should acknowledge the action', async () => {
    await redeemButtonCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    } as any);

    expect(mockAck).toHaveBeenCalled();
  });

  it('should fetch products and open a modal view', async () => {
    await redeemButtonCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    } as any);

    expect(TodoCartoes).toHaveBeenCalled();
    expect(mockClient.views.open).toHaveBeenCalledWith({
      trigger_id: 'mockTriggerId',
      view: expect.objectContaining({
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Generate Gift Card',
        },
        blocks: expect.any(Array),
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
      }),
    });
  });

  it('should create blocks with product details and next page button', async () => {
    await redeemButtonCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    } as any);

    const blocks = mockClient.views.open.mock.calls[0][0].view.blocks;
    expect(blocks).toEqual(redeemBlocks);
  });

  it('should handle errors and log them', async () => {
    const error = new Error('Test error');
    const responseError = { data: { response_metadata: error } };
    (TodoCartoes as jest.Mock).mockImplementation(() => ({
      fetchProducts: jest.fn().mockRejectedValue(responseError),
    }));

    console.error = jest.fn();

    await redeemButtonCallback({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
    } as any);

    expect(console.error).toHaveBeenCalledWith(responseError);
  });
});
