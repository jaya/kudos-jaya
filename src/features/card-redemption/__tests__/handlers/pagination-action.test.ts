import paginationActionHandler from '../../handlers/pagination-action';
import * as productListModal from '../../ui/product-list-modal';

jest.mock('../../ui/product-list-modal');
jest.mock('@/utils/logger');

describe('paginationActionHandler', () => {
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
          selected_option: {
            value: 'update,2',
          },
        },
      ],
    };

    (productListModal.getProductListBlocks as jest.Mock).mockResolvedValue([
      { type: 'section', text: { type: 'mrkdwn', text: 'Page 2' } },
    ]);

    (productListModal.getProductListView as jest.Mock).mockReturnValue({
      type: 'modal',
      title: { type: 'plain_text', text: 'Generate Gift Card' },
    });
  });

  it('should update modal with new page', async () => {
    await paginationActionHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(productListModal.getProductListBlocks).toHaveBeenCalledWith(2);
    expect(mockClient.views.update).toHaveBeenCalled();
  });

  it('should pass correct view_id and hash', async () => {
    await paginationActionHandler({
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
