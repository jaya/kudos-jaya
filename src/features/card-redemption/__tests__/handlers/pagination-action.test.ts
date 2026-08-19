import paginationActionHandler from '../../handlers/pagination-action';
import * as productListModal from '../../ui/product-list-modal';
import { RequestContext } from '@/context/RequestContext';

jest.mock('../../ui/product-list-modal');
jest.mock('@/utils/logger');
jest.mock('@/context/RequestContext');

describe('paginationActionHandler', () => {
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
          selected_option: {
            value: 'update,2',
          },
        },
      ],
      user: {
        team_id: 'T123',
      },
    };

    (productListModal.getProductListBlocks as jest.Mock).mockResolvedValue([
      { type: 'section', text: { type: 'mrkdwn', text: 'Page 2' } },
    ]);

    (productListModal.getProductListView as jest.Mock).mockReturnValue({
      type: 'modal',
      title: { type: 'plain_text', text: 'Generate Gift Card' },
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

  it('should update modal with new page', async () => {
    await paginationActionHandler({
      ack: mockAck,
      body: mockBody,
      client: { token: 'test-token' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(productListModal.getProductListBlocks).toHaveBeenCalledWith(2);
    expect(mockAdapter.updateModal).toHaveBeenCalled();
  });

  it('should pass correct view_id to adapter', async () => {
    await paginationActionHandler({
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
